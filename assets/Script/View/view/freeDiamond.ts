

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    _btn_close=null;
    _btn_watchVedio=null;
    
    onLoad(){
        this.initNode()
    }

    initNode(){
        this._btn_close=this.node.getChildByName("btn_close");
        this._btn_watchVedio=this.node.getChildByName("btn_watchVedio");
        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_watchVedio);
    }

    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_close"){
                this.node.destroy()
            }else if(e.target.getName()== "btn_watchVedio"){

            }
        })
    }

    
}
