import GameCtr from "../../Controller/GameCtr";
import Apron from "./Apron";
import GameData from "../../Common/GameData";
import PlaneFrameMG from "./PlaneFrameMG";
import Guide from "./Guide";
import ViewManager from "../../Common/ViewManager";
import AudioManager from "../../Common/AudioManager";
import Util from "../../Common/Util";


const { ccclass, property } = cc._decorator;

let boxTypeArr = ["freeGift", "buyGift", "ufoGift"];

@ccclass
export default class LandPlane extends cc.Component {

    private spr: cc.Sprite;

    private level = 1;

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
            // if (Guide.guideStep <= 7 && Guide.guideStep != 3 && Guide.guideStep != 4 && Guide.guideStep != 7) {
            //     if (this.apronTag == 1) {
            //         return false;
            //     }
            // }
            this.touchID = event.getID();
            this.isTouch = true;

            GameCtr.ins.mGame.showTrash();
            if (!this.moveNode) {
                GameCtr.lastZ = GameCtr.lastZ < 100 ? 100 : ++GameCtr.lastZ;
                this.node.parent.setLocalZOrder(GameCtr.lastZ);
                this.createMoveNode();
                this.moveNode.position = this.node.position;
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
        if (this.judgeApron(wPos)) {
            GameCtr.ins.mGame.hideTrash();
            return true;
        }

        return false;
    }

    judgeTrash(wPos) {
        let trash = GameCtr.ins.mGame.ndTrash;
        if (trash.getBoundingBoxToWorld().contains(wPos)) {
            if (this.level == GameData.maxPlaneLevel) return false;
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

                    GameCtr.ins.mGame.hideTrash();

                    let addGold = trash.getChildByName("AddGold");
                    let lb = addGold.getChildByName("lbNum").getComponent(cc.Label);
                })
            ));
            return true;
        } else {
            return false;
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
                    // if (Guide.guideStep <= 7) {
                    //     return false;
                    // }
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
        GameData.setApronState(otherParent.tag, otherPlane.level + 1);  //目标停机坪状态设为合成后的飞机等级
        GameCtr.ins.mGame.removeLandPlane(this.node);
        this.node.destroy();

        let tmpNode = this.moveNode;

        if (GameData.maxPlaneLevel < otherPlane.level + 1) {
            // GameCtr.ins.mGame.showUnlockPop(otherPlane.level + 1);    //弹出解锁弹窗
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
                if (otherPlane.level > GameData.maxPlaneLevel) {
                    GameData.maxPlaneLevel = otherPlane.level;
                }
                // if (Guide.guideStep <= 7) {
                //     Guide.setGuideStorage(++Guide.guideStep);
                // }
                let wPos = otherParent.parent.convertToWorldSpaceAR(otherParent.position);
                GameCtr.ins.mGame.showExpParticle(wPos);
                // GameCtr.ins.mGame.setPgbLevel();
                GameCtr.ins.mGame.showPortLight(otherParent);
                AudioManager.getInstance().playSound("audio/complex", false);
                GameData.setMissonData("composeTimes", GameData.missionData.composeTimes+1);
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
        PlaneFrameMG.setPlaneFrame(this.spr, level);
    }

    blink() {
        let blinkAni = this.node.getChildByName("ndBlink").getComponent(cc.Animation);
        blinkAni.play();
    }
    // update (dt) {}
}
