import PopupView from "./PopupView";
import GameData from "../../Common/GameData";
import ViewManager from "../../Common/ViewManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MissionPop extends cc.Component {

    @property(cc.Node)
    ndContent: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        let item;
        let lbLevel;
        let btnGet;
        let key;
        item = this.ndContent.children[0];
        lbLevel = this.ndContent.children[0].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日广告1次 (" + GameData.missionData.videoTimes + "/1)";
        btnGet = this.ndContent.children[0].getChildByName("blueBtn");
        key = "missionCollected_1";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[1];
        lbLevel = this.ndContent.children[1].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日广告3次 (" + GameData.missionData.videoTimes + "/3)";
        btnGet = this.ndContent.children[1].getChildByName("blueBtn");
        key = "missionCollected_2";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[2];
        lbLevel = this.ndContent.children[2].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日广告5次 (" + GameData.missionData.videoTimes + "/5)";
        btnGet = this.ndContent.children[2].getChildByName("blueBtn");
        key = "missionCollected_3";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[3];
        lbLevel = this.ndContent.children[3].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日开启5次加速 (" + GameData.missionData.speedTimes + "/5)";
        btnGet = this.ndContent.children[3].getChildByName("blueBtn");
        key = "missionCollected_4";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[4];
        lbLevel = this.ndContent.children[4].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日合成128次 (" + GameData.missionData.composeTimes + "/128)";
        btnGet = this.ndContent.children[4].getChildByName("blueBtn");
        key = "missionCollected_5";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[5];
        lbLevel = this.ndContent.children[5].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日开启宝箱10次 (" + GameData.missionData.boxTimes + "/10)";
        btnGet = this.ndContent.children[5].getChildByName("blueBtn");
        key = "missionCollected_6";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[6];
        lbLevel = this.ndContent.children[6].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日开启转盘2次 (" + GameData.missionData.turntableTimes + "/2)";
        btnGet = this.ndContent.children[6].getChildByName("blueBtn");
        key = "missionCollected_7";
        btnGet.active = !GameData.missionData[key];

        item = this.ndContent.children[7];
        lbLevel = this.ndContent.children[7].getChildByName("lbLevel").getComponent(cc.Label);
        lbLevel.string = "今日战斗10次 (" + GameData.missionData.fightTimes + "/10)";
        btnGet = this.ndContent.children[7].getChildByName("blueBtn");
        key = "missionCollected_8";
        btnGet.active = !GameData.missionData[key];
    }

    getMissionGift(event, data) {
        let btn = event.target;
        data = parseInt(data);
        switch (data) {
            case 1:
                if (GameData.missionData.videoTimes < 1) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 2:
                if (GameData.missionData.videoTimes < 3) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 3:
                if (GameData.missionData.videoTimes < 5) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 4:
                if (GameData.missionData.speedTimes < 5) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 5:
                if (GameData.missionData.composeTimes < 128) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 6:
                if (GameData.missionData.boxTimes < 10) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 7:
                if (GameData.missionData.turntableTimes < 2) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
            case 8:
                if (GameData.missionData.fightTimes < 10) {
                    ViewManager.toast("不满足领取条件，领取失败");
                    return;
                }
                break;
        }
        btn.active = false;
        GameData.diamonds += 50;
        let key = "missionCollected_" + data;
        GameData.setMissonData(key, true);
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
