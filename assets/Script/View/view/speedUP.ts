import GameData from "../../Common/GameData";
import GameCtr from "../../Controller/GameCtr";
import ViewManager from "../../Common/ViewManager";
import AudioManager from "../../Common/AudioManager";
import WXCtr from "../../Controller/WXCtr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    _btn_close=null;
    _btn_buy=null;
    _btn_watchVedio=null;
    _tipWatchVedio=null;
    _tipBuy=null;

    onLoad(){
        this.initNode();
    }

    initNode(){
        this._btn_close=this.node.getChildByName('btn_close');
        this._btn_buy=this.node.getChildByName('btn_buy');
        this._btn_watchVedio=this.node.getChildByName('btn_watchVedio');
        this._tipWatchVedio=this.node.getChildByName("tipNode").getChildByName("tip02");
        this._tipBuy=this.node.getChildByName("tipNode").getChildByName("tip01");

        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_buy);
        this.initBtnEvent(this._btn_watchVedio);
        
        
        if (!WXCtr.videoAd || GameCtr.surplusVideoTimes <= 0) {
            this._btn_watchVedio.active = false;
            this._tipWatchVedio.active=false;
            this._btn_buy.x=0;
            this._tipBuy.x=0;
        }
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            AudioManager.getInstance().playSound("audio/click", false);
            if(e.target.getName()=="btn_close"){
                this.node.destroy();
            }else if(e.target.getName()=="btn_buy"){
                this.buy();
                this.node.destroy();
            }else if(e.target.getName()=="btn_watchVedio"){
                let callFunc=()=>{
                    GameCtr.autoCompose=true;
                    GameCtr.isSpeedUpModel=true;
                    GameCtr.speedUpTime=120;
                    GameCtr.getInstance().getGame().showSpeedAni();
                    GameCtr.getInstance().getGame().showSpeedUpTimer();
                    GameData.setMissonData("speedTimes", GameData.missionData.speedTimes+1);
                }
            }
        })
    }

    buy(){
        if(GameData.diamonds>=50){
            GameCtr.autoCompose=true;
            GameCtr.isSpeedUpModel=true;
            GameCtr.speedUpTime=60;
            GameData.diamonds-=50;
            GameCtr.getInstance().getGame().setDiamonds();
            GameCtr.getInstance().getGame().showSpeedAni();
            GameCtr.getInstance().getGame().showSpeedUpTimer();
           
            GameData.setMissonData("speedTimes", GameData.missionData.speedTimes+1);
        }else {
            ViewManager.toast("钻石不足");
        }
    }
}
