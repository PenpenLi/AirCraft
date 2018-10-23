import GameData from "../../Common/GameData";
import GameCtr from "../../Controller/GameCtr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    _btn_close=null;
    _btn_buy=null;
    _btn_watchVedio=null;

    onLoad(){
        this.initNode();
    }

    initNode(){
        this._btn_close=this.node.getChildByName('btn_close');
        this._btn_buy=this.node.getChildByName('btn_buy');
        this._btn_watchVedio=this.node.getChildByName('btn_watchVedio');


        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_buy);
        this.initBtnEvent(this._btn_watchVedio);
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_close"){
                this.node.destroy();
            }else if(e.target.getName()=="btn_buy"){
                this.buy();
                this.node.destroy();
            }else if(e.target.getName()=="btn_watchVedio"){
                let callFunc=()=>{
                    GameCtr.speedUpTime=120
                }
            }
        })
    }

    buy(){
        if(GameData.gold>=50){
            GameCtr.speedUpTime=60;
            GameData.gold-=50;
            GameCtr.getInstance().getGame().showSpeedAni();
            GameCtr.getInstance().getGame().showSpeedUpTimer();
        }else {
            //showToast("金币不足")；
        }
    }
}
