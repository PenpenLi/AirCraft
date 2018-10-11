import GameData from "../../Common/GameData";
import PlaneFrameMG from "../game/PlaneFrameMG";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UnLockView extends cc.Component {

    @property(cc.Node)
    ndLight: cc.Node = null;
    @property(cc.Sprite)
    sprPlane: cc.Sprite = null;
    @property(cc.ProgressBar)
    pgbEarn: cc.ProgressBar = null;
    @property(cc.ProgressBar)
    pgbSpeed: cc.ProgressBar = null;
    // onLoad () {}

    start () {

    }

    setData(level) {
        this.ndLight.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.repeat(cc.rotateBy(3.0, 360), 9999)
        ));

        let maxProfit = GameData.getProfitOfPlane(30);
        let maxSpeed = 5*(1-Math.pow(0.001, (1/30)));
        PlaneFrameMG.setPlaneFrame(this.sprPlane, level, "land");
        
        let ratio = level / 30;
        this.pgbEarn.progress = ratio;

        let speed = GameData.getSpeedOfPlane(level);
        ratio = maxSpeed / speed;
        this.pgbSpeed.progress = ratio;

        this.sprPlane.node.runAction(cc.scaleTo(1.0, 2.0).easing(cc.easeBounceOut()));
    }
    // update (dt) {}
}
