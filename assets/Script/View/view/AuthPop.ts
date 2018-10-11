import PromptDialog from "./PromptDialog";
import WXCtr from "../../Controller/WXCtr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AuthPop extends PromptDialog {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    dismiss() {
        if(WXCtr.userInfoBtn) WXCtr.userInfoBtn.hide();
        super.dismiss();
    }

    // update (dt) {}
}
