import PopupView from "./PopupView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class PromptDialog extends cc.Component {

    @property(cc.Label)
    lbTitle: cc.Label = null;
    @property(cc.Node)
    ndTitle: cc.Node = null;
    @property(cc.Node)
    ndBtnClose: cc.Node = null;

    // onLoad () {}

    start () {

    }

    setData(data) {
        if(data.node) {
            this.node.addChild(data.node);
        }
        if(data.title){
            this.lbTitle.string = data.title;
        }else{
            this.ndTitle.active = false;
        }
        this.ndBtnClose.active = data.closeButton;
    }

    dismiss() {
        if (!this.node.parent) {
            return;
        }
        let popupView = this.node.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
    }

    // update (dt) {}
}
