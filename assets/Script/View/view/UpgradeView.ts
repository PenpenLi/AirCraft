import GameData from "../../Common/GameData";
import GameCtr from "../../Controller/GameCtr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UpgradeView extends cc.Component {

    @property(cc.Label)
    lbLevel: cc.Label = null;
    @property(cc.Label)
    lbDiamonds: cc.Label = null;
    @property(cc.Node)
    ndApron: cc.Node = null;
    @property(cc.Node)
    ndRunway: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    setLevel(level) {
        this.lbLevel.string = level + "";
        let diamonds = Math.floor(level/2)+1;
        this.lbDiamonds.string = "+"+diamonds;
        GameData.diamonds += diamonds;
        GameCtr.ins.mGame.setDiamonds();
        // GameData.changeDiamonds(diamonds, ()=>{GameCtr.ins.mGame.setDiamonds();});
        if(level <= 8){
            this.ndRunway.active = true;
            this.ndRunway.runAction(cc.sequence(
                cc.delayTime(0.2),
                cc.scaleTo(0.2, 1.0).easing(cc.easeBounceOut())
            ));
        }
        if(level <= 9) {
            this.ndApron.active = true;
            this.ndApron.runAction(cc.sequence(
                cc.delayTime(0.2),
                cc.scaleTo(0.2, 1.0).easing(cc.easeBounceOut())
            ));
        }
    }

    // update (dt) {}
}
