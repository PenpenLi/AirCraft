import AudioManager from "./AudioManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ButtonCommon extends cc.Component {

    private x;
    private y;
    private button: cc.Button;

    // use this for initialization
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchstart, this);

        this.button = this.node.getComponent(cc.Button);
    }

    touchstart() {
        AudioManager.getInstance().playSound("audio/click", false);
    }
    // update (dt) {}
}
