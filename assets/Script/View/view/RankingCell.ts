import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankingCell extends cc.Component {

    @property(cc.Sprite)
    sprHead: cc.Sprite = null;
    @property(cc.Label)
    lbLocation: cc.Label = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbGold: cc.Label = null;
    @property(cc.Label)
    lbRanking: cc.Label = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    private colorConfig = ["#FFB01A", "#FF70B6", "#C9EB3D"];

    start () {

    }

    setData(data) {
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
                this.lbRanking.fontSize = 120;
                this.lbRanking.lineHeight = 125;
                this.lbRanking.node.color = cc.hexToColor(this.colorConfig[data.top - 1]);
            }
        }
        if(data.City){
            this.lbLocation.string = data.City;
        }
    }
    // update (dt) {}
}
