import Util from "../../Common/Util";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    lb_hurt:cc.Label=null;

    showHurt(hurt){
        this.lb_hurt.string=Util.formatNum(hurt)+"";
    }
}
