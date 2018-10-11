import GameCtr from "../../Controller/GameCtr";
import WXCtr from "../../Controller/WXCtr";


const {ccclass, property} = cc._decorator;

declare let require: any;
const State = require('state-machine');

// let StateMachine = (window as any).StateMachine;

@ccclass
export default class Start extends cc.Component {

    @property(cc.Node)
    ndLoading: cc.Node = null;
    @property(cc.ProgressBar)
    pgbLoading: cc.ProgressBar = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        GameCtr.getInstance().setStart(this);
    }

    start () {
        this.showLoading();
    }

    showLoading() {
        this.pgbLoading.node.active = true;
        let plane = this.pgbLoading.node.getChildByName("plane");
        if (this.pgbLoading.progress <= 1) {
            this.scheduleOnce(() => {
                plane.x = this.pgbLoading.node.width * this.pgbLoading.progress - (this.pgbLoading.node.width / 2);
                this.pgbLoading.progress += 0.005;
                this.showLoading();
            }, 0.02);
        } else {
            this.pgbLoading.progress = 0;
            plane.x = this.pgbLoading.node.width * this.pgbLoading.progress - (this.pgbLoading.node.width / 2);
            this.showLoading();
        }
    }

    startGame() {
        GameCtr.gotoScene("Game");
    }

    // update (dt) {}
}
