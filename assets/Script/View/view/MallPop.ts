import GameData from "../../Common/GameData";
import PopupView from "../view/PopupView";
import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";
import ViewManager from "../../Common/ViewManager";

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
        if (GameData.diamonds < price) {
            ViewManager.toast("钻石不足");
            return;
        }
        switch (data) {
            case "1":
                GameData.gold += 100000;
                break;
            case "2":
                GameData.gold += 750000;
                break;
            case "3":
                GameData.gold += 5600000;
                break;
            case "4":
                GameCtr.doubleAttack = true;
                break;
            case "5":
                GameCtr.doubleGold = true;
                break;
            case "6":
                if (GameCtr.ins.mGame.getUnusedApronNum() > 0) {
                    GameCtr.ins.mGame.addPlane(7);
                } else {
                    ViewManager.toast("没有空位了！");
                    return;
                }
                break;
            case "7":
                if (GameCtr.ins.mGame.getUnusedApronNum() > 0) {
                    GameCtr.ins.mGame.addPlane(10);
                } else {
                    ViewManager.toast("没有空位了！");
                    return;
                }
                break;
            case "8":
                if (GameCtr.ins.mGame.getUnusedApronNum() > 0) {
                    GameCtr.ins.mGame.addPlane(12);
                } else {
                    ViewManager.toast("没有空位了！");
                    return;
                }
                break;
        }
        GameData.diamonds -= price;
        GameCtr.ins.mGame.setDiamonds();
    }

    close() {
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
