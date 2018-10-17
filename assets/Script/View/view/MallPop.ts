import GameData from "../../Common/GameData";
import PopupView from "../view/PopupView";
import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";

const { ccclass, property } = cc._decorator;

let itemNums = 30;

@ccclass
export default class MallPop extends cc.Component {

    onLoad() {

    }

    onDestroy() {
    }

    start() {

    }

    buy(event, data) {
        let nd: cc.Node = event.target;
        let price = parseInt(nd.getChildByName("price").getComponent(cc.Label).string);
        if (GameData.diamonds < price) return;
        switch (data) {
            case 1:
                GameData.gold += 100000;
                break;
            case 2:
                GameData.gold += 750000;
                break;
            case 3:
                GameData.gold += 5600000;
                break;
            case 4:
                GameCtr.doubleAttack = true;
                break;
            case 5:
                GameCtr.doubleGold = true;
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
