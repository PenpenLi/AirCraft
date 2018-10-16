const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _btn_play=null;
    _btn_back=null;
    _lb_gold=null;

    onLoad(){
        this.initNode();
    }

    initNode(){
        this._btn_play=this.node.getChildByName("btn_playAgain");
        this._btn_back=this.node.getChildByName("btn_back");
        this._lb_gold=this.node.getChildByName("lb_gold");
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_playAgain"){

            }else if(e.target.getName()=="btn_back"){

            }
        })
    }

    setGold(_gold){
        this._lb_gold=this.node.getChildByName("lb_gold");
    }

    
}
