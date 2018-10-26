import PopupView from "../view/PopupView";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import WXCtr from "../../Controller/WXCtr";
import AudioManager from "../../Common/AudioManager";
import Util from "../../Common/Util";
import HttpCtr from "../../Controller/HttpCtr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class OffLineProfit extends cc.Component {

    @property(cc.Node)
    ndLight: cc.Node = null;
    @property(cc.Label)
    lbProfit: cc.Label = null;
    @property(cc.Node)
    ndVedioBtn: cc.Node = null;
    @property(cc.Node)
    ndDiamonds: cc.Node = null;

    private offLineProfit = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.ndLight.runAction(cc.repeatForever(cc.rotateBy(2.0, 360)));
    }

    onDestroy() {
    }

    setOffLineProfit(offTime, profit) {
        let maxTime = 30 * 60;
        if (offTime > maxTime) offTime = maxTime;
        let minT = Math.ceil((offTime-90)/60);
        this.offLineProfit = profit*minT;
        this.lbProfit.string = "+" + Util.formatNum(this.offLineProfit);
        if (!WXCtr.videoAd || GameCtr.surplusVideoTimes <= 0) {
            this.ndVedioBtn.active = false;
        }
        this.ndDiamonds.active = GameCtr.reviewSwitch; 
    }

    clickDiamonds() {
        WXCtr.share({
            profit: true,
            callback: () => {
                this.offLineProfit *= 2;
                this.close();
            }
        })
        HttpCtr.clickStatistics(GameCtr.StatisticType.OFF_LINE_SHARE);              //离线分享收益点击统计
    }

    clickVedio() {
        if (WXCtr.videoAd) {
            AudioManager.getInstance().stopAll();
            WXCtr.showVideoAd();
            WXCtr.onCloseVideo((res) => {
                WXCtr.offCloseVideo();
                if (res) {
                    this.offLineProfit *= 3;
                }
                this.close();
            });
            HttpCtr.clickStatistics(GameCtr.StatisticType.OFF_LINE_VEDIO);          //离线视频收益点击统计
        }
    }

    close() {
        if (!this.node.parent) {
            return;
        }
        GameData.gold += this.offLineProfit;
        GameData.offLineProfit = 0;
        let popupView = this.node.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
    }

    // update (dt) {}
}
