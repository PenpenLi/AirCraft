

const { ccclass, property } = cc._decorator;

@ccclass
export default class MissionPop extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    getMissionGift(target, data) {
        switch (data) {
            case 1:

                break;
            case 2:

                break;
            case 3:

                break;
            case 4:

                break;
            case 5:

                break;
            case 6:

                break;
            case 7:

                break;
            case 8:

                break;
        }
    }

    close() {
        this.node.x = 5000;
    }

    // update (dt) {}
}
