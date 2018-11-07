import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";
import AudioManager from "../../Common/AudioManager";
import GameData from "../../Common/GameData";
import HttpCtr from "../../Controller/HttpCtr";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    _btn_back=null;
    _btn_playAgain=null;
    _lb_gold=null;
    @property(cc.Node)
    ndAd:cc.Node=null;

    @property(cc.Prefab)
    gameOverAd:cc.Node=null;

    onLoad(){
        this.initNode();
        GameCtr.doubleAttack=false;
        GameCtr.doubleGold=false; 

        if(GameCtr.reviewSwitch){
            this.ndAd.active=true;
            HttpCtr.getAdsByType(this.showAds.bind(this), "TwoJump");
        }
    }

    initNode(){
        this._btn_back=this.node.getChildByName("btn_back");
        this._btn_playAgain=this.node.getChildByName("btn_playAgain");
        this._lb_gold=this.node.getChildByName("lb_gold");
        this._lb_gold.getComponent(cc.Label).string=Util.formatNum(GameData.gold-GameCtr.fightStartGold);
        this.ndAd.active=false;
        
        this.initBtnEvent(this._btn_back);
        this.initBtnEvent(this._btn_playAgain);
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            AudioManager.getInstance().playSound("audio/click", false);
            if(e.target.getName()=="btn_playAgain"){
                GameCtr.getInstance().getFight().clear();
                GameCtr.getInstance().getFight().resetGame();
                this.node.destroy();

            }else if(e.target.getName()=="btn_back"){
                cc.director.loadScene("Game");
            }
            
        })
    }


    showAds(ads){
        this.ndAd.active=true;
        for(let i=0;i<ads.data.length;i++){
            if(i>=6){return;}

            let ad=cc.instantiate(this.gameOverAd)
            ad.parent=this.ndAd;
            ad.getComponent("GameOverAd").init(ads.data[i],i);
            ad.x=-300+i%3*300;
            ad.y=225+Math.floor(i/3)*(-390);
        }
    } 
}
