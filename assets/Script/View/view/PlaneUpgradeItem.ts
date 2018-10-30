import PlaneFrameMG from "../game/PlaneFrameMG";
import GameData from "../../Common/GameData";
import Util from "../../Common/Util";
import AudioManager from "../../Common/AudioManager";
import GameCtr from "../../Controller/GameCtr";

const {ccclass, property} = cc._decorator;

const baseLife = 2;

@ccclass
export default class PlaneUpgradeItem extends cc.Component {

    @property(cc.Sprite)
    sprPlane: cc.Sprite = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbLevel: cc.Label = null;
    @property(cc.Label)
    lbPrice: cc.Label = null;
    @property(cc.Label)
    lbAttribute: cc.Label = null;
    @property(cc.Node)
    ndButton: cc.Node = null;

    private level = 1;
    private idx = 1;
    private info = null;
    private price = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    public setData(data) {
        this.idx = data.idx;
        this.level = data.level;
        PlaneFrameMG.setPlaneFrame(this.sprPlane, data.idx);
        this.info = GameData.planesConfig[data.idx-1];
        this.lbName.string = this.info.name;
        this.setLevel(this.level);
    }

    private setLevel(level){
        if(this.idx > GameData.maxPlaneLevel) {
            this.lbLevel.node.active = false;
            this.lbAttribute.node.active = false;
            this.sprPlane.node.opacity = 180;
            this.ndButton.active = false;
            return;
        }else{
            this.lbLevel.node.active = true;
            this.lbAttribute.node.active = true;
            this.sprPlane.node.opacity = 255;
            this.ndButton.active = true;
        }
        this.lbLevel.string = "等级 "+level;
        let attact = this.info.baseAttack+this.info.attackIncrease*(level-1);
        let life = baseLife;
        if(level > 100) {
            life = 6;
        }else{
            life += Math.floor(level / 25);
        }
        this.lbAttribute.string = "攻击"+attact+" 生命"+life;
        this.price = this.info.basePrice*level;
        this.lbPrice.string = Util.formatNum(this.price);
    }

    clickUpgrade() {
        if(GameData.gold >= this.price){
            this.setLevel(++this.level);
            GameData.gold -= this.price;
            GameCtr.ins.mGame.setDiamonds();
            GameData.setPlaneLevel(this.idx, this.level);
            AudioManager.getInstance().playSound("audio/sound_p7_up", false);
        }
    }

    // update (dt) {}
}
