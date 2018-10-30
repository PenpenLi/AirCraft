import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankingCell extends cc.Component {

    @property(cc.Sprite)
    sprHead: cc.Sprite = null;
    @property(cc.Sprite)
    sprMedal: cc.Sprite = null;
    @property(cc.Label)
    lbLocation: cc.Label = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbGold: cc.Label = null;
    @property(cc.Label)
    lbRanking: cc.Label = null;
    @property([cc.SpriteFrame])
    medalsFrames: cc.SpriteFrame[] = [];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    setData(data) {
        console.log("rankingCellData == ", data);
        if(data.Icon){
            Util.loadImg(this.sprHead, data.Icon);
        }
        if(data.nick){
            this.lbName.string = Util.cutstr(data.nick, 12);
        }
        if(data.value){
            this.lbGold.string = Util.formatNum(data.value);
        }
        if(data.top && this.lbRanking){
            this.lbRanking.string = data.top;
            if(data.top <= 3) {
                this.lbRanking.node.active = false;
                this.sprMedal.node.active = true;
                this.sprMedal.spriteFrame = this.medalsFrames[data.top-1];
            }else{
                this.lbRanking.node.active = true;
                this.sprMedal.node.active = false;
            }
        }
        if(data.City){
            this.lbLocation.string = data.City;
        }
    }
    // update (dt) {}
}
