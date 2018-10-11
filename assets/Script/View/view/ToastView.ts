import PopupView from "./PopupView";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ToastView extends PopupView {

    @property(cc.Label)
    messageLabel: cc.Label = null;

    private message: string;
    private _showTime = 1.5;//显示时长

    onLoad() {
        super.onLoad();
    }

    setMessage(message) {
        this.message = message || "提示";
        this.messageLabel.string = message;
    }

    setFontSize(fontSize: number = 0) {
        if (fontSize > 0) {
            this.messageLabel.fontSize = fontSize;
            this.messageLabel.lineHeight = fontSize;
        }
    }

    setTextColor(textColor: cc.Color = null) {
        if (textColor) {
            this.messageLabel.node.color = textColor;
        }
    }

    setShowTime(time: number = null) {
        if(time) {
            this._showTime = time;
        }
    }

    show(parent: cc.Node) {
        super.show(parent);
        this.unscheduleAllCallbacks();
        this.schedule(this.delayDismiss.bind(this), this._showTime);
    }

    private delayDismiss() {
        this.dismiss();
    }

    // update (dt) {}
}
