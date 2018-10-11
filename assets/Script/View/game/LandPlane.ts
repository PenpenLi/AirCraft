import GameCtr from "../../Controller/GameCtr";
import FlyPlane from "./FlyPlane";
import Apron from "./Apron";
import GameData from "../../Common/GameData";
import PlaneFrameMG from "./PlaneFrameMG";
import Guide from "./Guide";
import ViewManager from "../../Common/ViewManager";
import AudioManager from "../../Common/AudioManager";


const { ccclass, property } = cc._decorator;

let boxTypeArr = ["freeGift", "buyGift", "ufoGift"];

@ccclass
export default class LandPlane extends cc.Component {

    @property(cc.Sprite)
    sprBox: cc.Sprite = null;

    private spr: cc.Sprite;

    private level = 1;
    private isFlying = false;

    public apronTag = 0;

    public moveNode = null;

    public isTouch = false;                                                     //是否有触摸事件发生
    public touchID = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.spr = this.node.getComponent(cc.Sprite);
        this.registerTouch();
    }

    start() {

    }

    registerTouch() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event) {
        if (!this.isTouch && !this.touchID) {
            if (Guide.guideStep <= 7 && Guide.guideStep != 3 && Guide.guideStep != 4 && Guide.guideStep != 7) {
                if (this.apronTag == 1) {
                    return false;
                }
            }
            this.touchID = event.getID();
            this.isTouch = true;


            if (!this.isFlying) {
                GameCtr.ins.mGame.showTrash();
                if (!this.moveNode) {
                    GameCtr.lastZ = GameCtr.lastZ < 100 ? 100 : ++GameCtr.lastZ;
                    this.node.parent.setLocalZOrder(GameCtr.lastZ);
                    this.node.parent.parent.setLocalZOrder(GameCtr.lastZ);
                    this.createMoveNode();
                    this.moveNode.position = this.node.position;
                }
            } else {
                this.recyclePlane();
            }
        }
    }

    onTouchMove(event) {
        if (this.isTouch && event.getID() == this.touchID) {
            let tPos = this.node.parent.convertTouchToNodeSpaceAR(event.touch);
            if (this.moveNode) {
                this.moveNode.position = tPos;
            }
        }
    }

    onTouchEnd(event) {
        if (this.isTouch && event.getID() == this.touchID) {
            this.isTouch = false;
            this.touchID = 0;

            let tPos = this.node.parent.convertTouchToNodeSpaceAR(event.touch);
            let wPos = this.node.parent.convertToWorldSpaceAR(tPos);

            if (this.moveNode) {
                if (!this.judge(wPos)) {
                    this.recycleMoveNode();
                    GameCtr.ins.mGame.hideTrash();
                }
            }
        }
    }

    createMoveNode() {
        this.moveNode = new cc.Node();
        let sprite = this.moveNode.addComponent(cc.Sprite);
        sprite.spriteFrame = this.spr.spriteFrame;
        this.node.parent.addChild(this.moveNode);
        this.node.opacity = 180;
    }

    recycleMoveNode() {
        this.moveNode.runAction(cc.sequence(
            cc.moveTo(0.2, this.node.position),
            cc.callFunc(() => {
                this.moveNode.destroy();
                this.moveNode = null;
                this.node.opacity = 255;
            })
        ));
    }

    judge(wPos) {
        if (this.judgeTrash(wPos)) {
            return true;
        }
        if (this.judgeStart(wPos)) {
            GameCtr.ins.mGame.hideTrash();
            return true;
        }
        if (this.judgeApron(wPos)) {
            GameCtr.ins.mGame.hideTrash();
            return true;
        }

        return false;
    }

    judgeTrash(wPos) {
        let trash = GameCtr.ins.mGame.ndTrash;
        if (trash.getBoundingBoxToWorld().contains(wPos)) {
            if(this.level == GameData.maxPlaneLevel) return false;
            GameData.setApronState(this.node.parent.tag, 0);   //自己停机坪状态设为0（没有飞机）
            this.moveNode.runAction(cc.sequence(
                cc.scaleTo(0.3, 0),
                cc.callFunc(() => {
                    this.moveNode.destroy();
                    this.moveNode = null;
                    let pApron = this.node.parent.getComponent(Apron);
                    pApron.plane = null;
                    pApron.isUsed = false;
                    GameData.setApronState(this.node.parent.tag, 0);   //自己停机坪状态设为0（没有飞机）
                    GameCtr.ins.mGame.removeLandPlane(this.node);
                    this.node.destroy();
                    let profit = Math.floor(GameData.getPriceOfPlane(this.level, 0));
                    GameData.gold += profit;
                    GameCtr.ins.mGame.setGold();
                    GameCtr.ins.mGame.hideTrash();
                    if (GameCtr.freeMallPlaneNum > 0) {
                        GameCtr.ins.mGame.addFreeMallPlane();
                    }
                    else if (GameCtr.leftUfoBox > 0) {
                        GameCtr.ins.mGame.addUFOGiftBox();
                    }

                    let addGold = trash.getChildByName("AddGold");
                    let lb = addGold.getChildByName("lbNum").getComponent(cc.Label);
                    lb.string = "+" + GameCtr.formatNum(profit);
                    addGold.runAction(cc.sequence(
                        cc.moveTo(0, cc.v2(23, -23)),
                        cc.moveBy(0.5, cc.v2(0, 100)),
                        cc.moveBy(0, cc.v2(1000, 0))
                    ));
                })
            ));
            return true;
        } else {
            return false;
        }
    }

    //检测飞机是否在起飞的地方
    judgeStart(wPos) {
        let startNode = GameCtr.ins.mGame.ndStartingZone;
        let runwayBeUsed = GameCtr.ins.mGame.runwayUsed + 1;
        if (startNode.getBoundingBoxToWorld().contains(wPos)) {
            if (runwayBeUsed <= GameCtr.ins.mGame.runways) {
                AudioManager.getInstance().playSound("audio/runway", false);
                GameCtr.ins.mGame.addFlyPlane(this);
                this.moveNode.destroy();
                this.moveNode = null;
                this.setToFlyState();
                GameData.setPlaneStateOfApron(this.node.parent.tag, true);
                if (Guide.guideStep <= 7) {
                    Guide.setGuideStorage(++Guide.guideStep);
                }
                return true;
            } else {
                ViewManager.toast("跑道已满！");
                return false;
            }
        }
    }

    //检测飞机是否在停机坪
    judgeApron(wPos) {
        let allPort = GameCtr.ins.mGame.allPort;
        let pApron = this.node.parent.getComponent(Apron);
        for (let i = 0; i < allPort.length; i++) {
            let port = allPort[i];
            let apron: Apron = port.getComponent(Apron);
            if (apron == pApron) {
                continue;
            }
            let rect = port.getChildByName("rect");
            if (rect.getBoundingBoxToWorld().contains(wPos)) {
                if (!apron.isUsed) {
                    if (Guide.guideStep <= 7) {
                        return false;
                    }
                    pApron.plane = null;
                    pApron.isUsed = false;
                    GameData.setApronState(this.node.parent.tag, 0);   //自己停机坪状态设为0（没有飞机）
                    this.node.parent = port;
                    this.node.opacity = 255;
                    this.node.position = cc.v2(0, 0);
                    apron.plane = this;
                    apron.isUsed = true;
                    this.moveNode.destroy();
                    this.moveNode = null;
                    GameData.setApronState(port.tag, this.level);    //目标停机坪状态设为当前飞机等级
                    AudioManager.getInstance().playSound("audio/click", false);
                    return true;
                } else {
                    if (apron.plane.isFlying) {
                        return false;
                    } else {
                        if (apron.plane.level == this.level) {
                            if (this.level < GameData.maxPlane) {
                                this.composePlane(apron.plane);
                            } else {
                                this.exChangePlane(apron, wPos);
                                AudioManager.getInstance().playSound("audio/click", false);
                                ViewManager.toast("已达到等级上限，新的飞机正在路上！");
                            }
                        } else {
                            this.exChangePlane(apron, wPos);
                            AudioManager.getInstance().playSound("audio/click", false);
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }

    //两个飞机交换位置
    exChangePlane(otherApron, wPos) {
        let otherPlane = otherApron.plane;
        let otherParent = otherPlane.node.parent;
        let selfApron = this.node.parent.getComponent(Apron);
        otherPlane.node.parent = this.node.parent;
        GameData.setApronState(this.node.parent.tag, otherPlane.level);
        otherPlane.createMoveNode();
        otherPlane.moveNode.position = this.node.parent.convertToNodeSpaceAR(wPos);
        otherPlane.recycleMoveNode();

        this.node.parent = otherParent;
        GameData.setApronState(otherParent.tag, this.level);
        let tPos = otherParent.convertToNodeSpaceAR(wPos);
        if (this.moveNode) {
            this.moveNode.parent = otherParent;
            this.moveNode.position = tPos;
        }
        otherApron.plane = this;
        selfApron.plane = otherPlane;
        this.recycleMoveNode();
    }

    //合成飞机
    composePlane(otherPlane) {
        let otherParent = otherPlane.node.parent;
        this.moveNode.parent = otherParent;
        this.moveNode.position = cc.v2(0, 0);
        otherPlane.createMoveNode();
        otherPlane.moveNode.position = cc.v2(0, 0);
        let pApron = this.node.parent.getComponent(Apron);
        pApron.reset();
        GameData.setApronState(this.node.parent.tag, 0);     //自己停机坪状态设为0（没有飞机）
        GameData.setApronState(otherParent.tag, otherPlane.level+1);  //目标停机坪状态设为合成后的飞机等级
        GameCtr.ins.mGame.removeLandPlane(this.node);
        this.node.destroy();

        if (GameCtr.freeMallPlaneNum > 0) {
            GameCtr.ins.mGame.addFreeMallPlane();
        }
        else if (GameCtr.leftUfoBox > 0) {
            GameCtr.ins.mGame.addUFOGiftBox();
        }

        let tmpNode = this.moveNode;

        if (GameData.maxPlaneLevel < otherPlane.level + 1) {
            GameCtr.ins.mGame.showUnlockPop(otherPlane.level + 1);    //弹出解锁弹窗
        }

        AudioManager.getInstance().playSound("audio/click", false);
        this.moveNode.runAction(cc.sequence(
            cc.moveBy(0.15, cc.v2(100, 0)).easing(cc.easeSineOut()),
            cc.moveBy(0.15, cc.v2(-100, 0)).easing(cc.easeSineIn()),
            cc.callFunc(() => {
                tmpNode.destroy();
                tmpNode = null;
            }),
        ));
        otherPlane.moveNode.runAction(cc.sequence(
            cc.moveBy(0.15, cc.v2(-100, 0)).easing(cc.easeSineOut()),
            cc.moveBy(0.15, cc.v2(100, 0)).easing(cc.easeSineIn()),
            cc.callFunc(() => {
                otherPlane.setLevel(++otherPlane.level);
                otherPlane.node.opacity = 255;
                otherPlane.node.runAction(cc.sequence(
                    cc.scaleTo(0.1, 1.5).easing(cc.easeSineOut()),
                    cc.scaleTo(0.1, 1.0).easing(cc.easeSineIn()),
                ));
                if (otherPlane.moveNode) {
                    otherPlane.moveNode.destroy();
                    otherPlane.moveNode = null;
                }
                GameData.addExperience(otherPlane.level);
                if (otherPlane.level > GameData.maxPlaneLevel) {
                    GameData.maxPlaneLevel = otherPlane.level;
                }
                if (Guide.guideStep <= 7) {
                    Guide.setGuideStorage(++Guide.guideStep);
                }
                let wPos = otherParent.parent.convertToWorldSpaceAR(otherParent.position);
                GameCtr.ins.mGame.showExpParticle(wPos);
                // GameCtr.ins.mGame.setPgbLevel();
                GameCtr.ins.mGame.showPortLight(otherParent);
                AudioManager.getInstance().playSound("audio/complex", false);
            }),
        ));
    }

    setLevel(level) {
        this.level = level;
        this.setFrame(level);
    }

    getLevel() {
        return this.level;
    }

    setFrame(level) {
        PlaneFrameMG.setPlaneFrame(this.spr, level, "land");
    }

    showBox(boxType) {
        let idx = boxTypeArr.indexOf(boxType);
        if (idx != -1) {
            this.sprBox.node.active = true;
            PlaneFrameMG.setBoxFrame(this.sprBox, idx);
            if (Guide.guideStep <= 7) {
                return;
            }
            this.sprBox.node.runAction(cc.sequence(
                cc.delayTime(3.0),
                cc.rotateBy(0.05, 10),
                cc.rotateBy(0.05, -20),
                cc.rotateBy(0.05, 20),
                cc.rotateBy(0.05, -20),
                cc.rotateBy(0.05, 20),
                cc.rotateBy(0.05, -20),
                cc.rotateBy(0.05, 20),
                cc.rotateBy(0.05, -20),
                cc.rotateBy(0.05, 20),
                cc.rotateBy(0.05, -10),
                cc.callFunc(() => {
                    GameCtr.ins.mGame.showPortLight(this.node.parent);
                }),
                cc.removeSelf()
            ));
        }
    }

    clickBox() {
        this.sprBox.node.stopAllActions();
        this.sprBox.node.runAction(cc.sequence(
            cc.rotateBy(0.05, 10),
            cc.rotateBy(0.05, -20),
            cc.rotateBy(0.05, 20),
            cc.rotateBy(0.05, -20),
            cc.rotateBy(0.05, 20),
            cc.rotateBy(0.05, -20),
            cc.rotateBy(0.05, 20),
            cc.rotateBy(0.05, -20),
            cc.rotateBy(0.05, 20),
            cc.rotateBy(0.05, -10),
            cc.callFunc(() => {
                GameCtr.ins.mGame.showPortLight(this.node.parent);
            }),
            cc.removeSelf()
        ));
        if (Guide.guideStep <= 7) {
            Guide.setGuideStorage(++Guide.guideStep);
        }
    }

    setToFlyState() {
        this.node.opacity = 180;
        this.node.children[0].active = true;
        this.isFlying = true;
    }

    resetState() {
        this.node.opacity = 255;
        this.isFlying = false;
        this.node.children[0].active = false;
    }

    recyclePlane() {
        let flyArr = GameCtr.ins.mGame.flyPlaneArr;

        let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        for (let i = 0; i < flyArr.length; i++) {
            let flyPlane: FlyPlane = flyArr[i];
            if (flyPlane.land.apronTag == this.apronTag && flyPlane.getLevel() == this.level) {
                flyPlane.landToAirPort(wPos);
                GameData.setPlaneStateOfApron(this.node.parent.tag, false);
                GameData.reduceProfitOfPlane(this.level);
                GameCtr.ins.mGame.setProfit();
                break;
            }
        }
        if (Guide.guideStep <= 7) {
            Guide.setGuideStorage(++Guide.guideStep);
        }
    }

    // update (dt) {}
}
