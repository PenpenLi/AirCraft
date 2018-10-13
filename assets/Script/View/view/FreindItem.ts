import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import Util from "../../Common/Util";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FreindItem extends cc.Component {

    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbDiamonds: cc.Label = null;
    @property(cc.Node)
    ndHook: cc.Node = null;
    @property(cc.Sprite)
    sprHead: cc.Label = null;
    
    // LIFE-CYCLE CALLBACKS:

    //未完成 #FB5151， 已完成 #40750B
    // onLoad () {}

    start () {

    }

    setData(data) {
        if(data.value){
            this.lbDiamonds.string = "+"+data.value;
        }
        if(data.ok){
            if(data.nick){
                this.lbName.string = data.nick;
            }else{
                this.lbName.string = "??????";
            }

            if(data.Icon){
                Util.loadImg(this.sprHead, data.Icon);
            }
            this.ndHook.active = true;
        }
    }

    // update (dt) {}
}
