import GameCtr from "../../Controller/GameCtr";
import FreindItem from "./FreindItem";
import PopupView from "./PopupView";
import WXCtr from "../../Controller/WXCtr";
import UserManager from "../../Common/UserManager";
import GameData from "../../Common/GameData";


const { ccclass, property } = cc._decorator;

const diamondsConfig = [0, 5, 10, 20, 40, 75, 105, 130, 150, 165, 175];

@ccclass
export default class InviteFriends extends cc.Component {

    @property(cc.Node)
    ndScr: cc.Node = null;
    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Label)
    lbDiamonds: cc.Label = null;
    @property(cc.Prefab)
    pfFriendItem: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    private itemPages;
    private pageSize = 10;
    private cellHeight = 180;
    private contentOrigin = 900;

    private data;

    onLoad() {
        this.itemPages = 1;
        this.reigsterTouch();
        this.lbDiamonds.string = GameData.diamonds + "";
    }

    onDestroy() {

    }

    start() {
        GameCtr.getInviteResult((data) => {
            this.setData(data);
            this.addItems();
        });
        GameCtr.dianmondNotice((resp) => {
            if (resp.moeny) {
                GameData.diamonds += resp.moeny;
                GameCtr.ins.mGame.setDiamonds();
            }
        });
    }

    setData(data) {
        this.data = data;

        WXCtr.getStorageData("inviteNum", (resp) => {
            let startNum = 0;
            let inviteNum = 0;
            if (resp) {
                if (UserManager.user.data_5 && UserManager.user.data_5 > resp) {
                    startNum = UserManager.user.data_5;
                    inviteNum = UserManager.user.data_5;
                } else {
                    startNum = resp;
                    inviteNum = resp;
                }
            } else {
                if (UserManager.user.data_5) {
                    startNum = UserManager.user.data_5;
                    inviteNum = UserManager.user.data_5;
                }
            }
            let addNum = 0;
            for (let i = startNum; i < data.length; i++) {
                if (data[i].ok) {
                    addNum += data[i].value;
                    inviteNum = data[i].top;
                }
            }
            GameData.diamonds += addNum;
            GameData.setUserData({ inviteNum: inviteNum });
            GameCtr.submitUserData({ data_5: inviteNum });
            GameCtr.ins.mGame.setDiamonds();
        });
    }

    reigsterTouch() {
        this.ndScr.on(cc.Node.EventType.TOUCH_MOVE, this.onScrTouchMoved, this);
    }

    onScrTouchMoved(event) {
        if (this.ndContent.y > this.contentOrigin + (this.itemPages * this.pageSize - 11) * this.cellHeight) {
            if (this.itemPages < Math.ceil(this.data.length / 10)) {
                this.itemPages++;
                this.addItems();
            }
        }
    }



    addItems() {
        for (let i = (this.itemPages - 1) * this.pageSize; i < this.itemPages * this.pageSize; i++) {
            let item = cc.instantiate(this.pfFriendItem);
            this.ndContent.addChild(item);
            let comp = item.getComponent(FreindItem);
            if (this.data[i]) {
                comp.setData(this.data[i]);
            }
        }
    }

    setItems(data) {
        for (let i = 0; i < 50; i++) {
            let item = cc.instantiate(this.pfFriendItem);
            this.ndContent.addChild(item);
            let comp = item.getComponent(FreindItem);
            if (data[i]) {
                comp.setData(data[i]);
            }
        }
    }

    invite() {
        GameCtr.clickStatistics(GameCtr.StatisticType.INVITE);                               //邀请分享统计
        WXCtr.share({
            invite: true
        })
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
