import GameCtr from "../../Controller/GameCtr";
import LandPlane from "./LandPlane";
import GameData from "../../Common/GameData";
import PlaneFrameMG from "./PlaneFrameMG";
import AudioManager from "../../Common/AudioManager";
import SpeedTotal from "./SpeedTotal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FlyPlane extends cc.Component {

    @property(cc.Node)
    ndParticle: cc.Node = null;

    private spr: cc.Sprite;
    private mLand: LandPlane;


    private level = 1;                                  //飞机等级
    private speed = 500;
    private acceleration = 0.0;                           //加速比例

    private idx = 0;

    private isKnockGold = false;                        //是否碰撞到金币区域

    private routePosArr = [];
    private goldZone;
    private startingZone;

    onLoad () {
        this.spr = this.node.getChildByName("spr").getComponent(cc.Sprite);
        this.goldZone = GameCtr.ins.mGame.ndGoldZone;
        this.startingZone = GameCtr.ins.mGame.ndStartingZone;
    }

    start () {

    }

    set land(land) {
        this.mLand = land;
    }

    get land() {
        return this.mLand;
    }

    setLevel(level){
        this.level = level;
        this.setFrame(level);
        let time = GameData.getSpeedOfPlane(this.level);
        this.speed = 4000 / time;
    }

    getLevel() {
        return this.level;
    }

    setFrame(level) {
        PlaneFrameMG.setPlaneFrame(this.spr, level, "fly");
    }

    readFly(random = false) {
        let idx = 0;
        this.routePosArr = GameCtr.ins.mGame.routePosArr;
        if(random)
        idx = Math.floor(Math.random()*this.routePosArr.length);
        this.idx = idx;
        this.node.position = this.routePosArr[idx];
        this.fly();
        this.schedule(this.goldCheck, 0);
    }

    speedUp(ratio) {
        this.acceleration = ratio;
        if(ratio > 0){
            this.ndParticle.active = true;
        }else{
            this.ndParticle.active = false;
        }
    }

    fly() {
        let tPos = this.routePosArr[this.idx];
        let oPos = this.node.position;
        let distance = cc.pDistance(tPos, oPos);
        let vector = cc.v2(tPos.x - oPos.x, tPos.y - oPos.y);
        let radian = cc.pAngleSigned(vector, cc.v2(0, 1));
        let rotation = cc.radiansToDegrees(radian);
        let duration = distance / (this.speed * (1+this.acceleration)); 
        this.node.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(duration, tPos),
                cc.rotateTo(duration, rotation)
            ),
            cc.callFunc(()=>{
                if(this.idx < this.routePosArr.length-1){
                    this.idx++;
                }else{
                    this.idx = 0;
                }
                this.fly();
            })
        ));
    }

    landToAirPort(wpos) {
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        this.idx = 0;
        let tPos = this.node.parent.convertToNodeSpaceAR(wpos)
        this.node.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(0.1, tPos),
                cc.rotateTo(0.1, 0)
            ),
            cc.callFunc(()=>{
                this.mLand.resetState();
                GameCtr.ins.mGame.removeFlyPlane(this.node);
            })
        ));
    }

    goldCheck() {
        let wPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
        if(this.goldZone.getBoundingBoxToWorld().contains(wPos)){
            if(!this.isKnockGold){
                this.isKnockGold = true;
                GameData.addGold(this.level);
                GameCtr.ins.mGame.setGold();
                let num = Math.floor(25*Math.pow(2, (this.level-1)*0.9));
                if(GameCtr.ufoProfitBuff){
                    num *= 5;
                }
                this.addGold(num);
            }
        }

        if(this.startingZone.getBoundingBoxToWorld().contains(wPos)){
            this.isKnockGold = false;
        }
    }

    addGold(num) {
        let node = GameCtr.ins.mGame.goldNumPool.get();
        node.active = true;
        let lb = node.getChildByName("lbNum").getComponent(cc.Label);
        lb.string = "+"+GameCtr.formatNum(num);
        this.goldZone.addChild(node);
        node.runAction(cc.sequence(
            cc.moveBy(0.5, cc.v2(0, 150)),
            cc.callFunc(()=>{
                node.position = cc.v2(0,0);
                GameCtr.ins.mGame.goldNumPool.put(node);
            })
        ));

        let ndGoldParticle = GameCtr.ins.mGame.goldParticlePool.get();
        ndGoldParticle.active = true;
        let particle = ndGoldParticle.getComponent(cc.ParticleSystem);
        particle.resetSystem();
        this.goldZone.addChild(ndGoldParticle);
        ndGoldParticle.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{GameCtr.ins.mGame.goldParticlePool.put(ndGoldParticle);})
        ));

        let final = this.goldZone.getChildByName("final");
        final.runAction(cc.sequence(
            cc.scaleTo(0.2, 1.6).easing(cc.easeSineIn()),
            cc.scaleTo(0.2, 1)
        ))
        if(!GameCtr.ins.mGame.ndLoading.active){
            AudioManager.getInstance().playSound("audio/gold", false); 
        }
    }

    // update (dt) {
        
    // }
}
