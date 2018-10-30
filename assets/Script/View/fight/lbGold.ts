import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    setValue(value){
        this.node.getComponent(cc.Label).string=Util.formatNum(value)+"" 
    }
}
