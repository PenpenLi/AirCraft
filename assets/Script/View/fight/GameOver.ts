import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _btn_play=null;
    _btn_back=null;
    _lb_gold=null;

    onLoad(){
        this.initNode();
        this.initLights();
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

    initLights(){
        let lights=this.node.getChildByName("lights");
        for(let i=0;i<lights.children.length;i++){
            lights.children[i].rotation=30*i;
        }

        for(let i=0;i<lights.children.length;i++){
            lights.children[i].runAction(cc.repeatForever(cc.rotateBy(1,45)));
        }
    }

    setGold(_gold){
        this._lb_gold.getComponent(cc.Label).string=Util.formatNumber(_gold);
    }

    
}
