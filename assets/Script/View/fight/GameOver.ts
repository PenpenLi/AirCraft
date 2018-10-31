import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";
import AudioManager from "../../Common/AudioManager";
import GameData from "../../Common/GameData";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _btn_play=null;
    _btn_back=null;
    _lb_gold=null;

    @property(cc.Node)
    ndLights:cc.Node=null;

    onLoad(){
        
        this.initNode();
        GameCtr.doubleAttack=false;
        GameCtr.doubleGold=false;

        
    }

    initNode(){
        this._btn_play=this.node.getChildByName("btn_playAgain");
        this._btn_back=this.node.getChildByName("btn_back");
        this._lb_gold=this.node.getChildByName("lb_gold");
        this.initBtnEvent(this._btn_play);
        this.initBtnEvent(this._btn_back);
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            AudioManager.getInstance().playSound("audio/click", false);
            cc.director.resume();
            if(e.target.getName()=="btn_playAgain"){
                GameCtr.getInstance().getFight().clear();
                GameCtr.getInstance().getFight().resetGame();
                this.node.destroy();
            }else if(e.target.getName()=="btn_back"){
                cc.director.loadScene("Game");
            }
            
        })
    }

    setGold(_gold){
        this._lb_gold.getComponent(cc.Label).string=Util.formatNum(GameData.gold-GameCtr.fightStartGold);
    }


    update(dt){
        this.ndLights.rotation+=2;
    }

    
}
