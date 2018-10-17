
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    _ani=null;
    onLoad(){
        this._ani=this.node.getComponent(cc.Animation);

        this._ani.on("finished",()=>{
            this.node.destroy();
        })
    }
}
