const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginAwardCell extends cc.Component {

    @property(cc.Node)
    ndSigned: cc.Node = null;
    @property(cc.Label)
    lbDiamondsNum: cc.Label = null;
    @property(cc.Sprite)
    sprGiftIcon: cc.Sprite = null;
    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    setData(data) {
        this.lbDiamondsNum.string = data.money+"";
    }

    signed() {
        this.ndSigned.active = true;
    }

    // update (dt) {}
}
