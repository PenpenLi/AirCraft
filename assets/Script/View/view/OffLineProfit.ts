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

    }

    onDestroy() {
        GameCtr.ins.mGame.autoShowLoginAward();
    }

    setOffLineProfit(offTime, profit) {
        let maxTime = 8 * 60 * 60;
        if (offTime > maxTime) offTime = maxTime;
        this.offLineProfit = profit;
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
                GameCtr.playBgm();
                if (res) {
                    this.offLineProfit *= 2;
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
        GameCtr.ins.mGame.showOffLineProfitParticle();
        AudioManager.getInstance().setSoundVolume(1);
        AudioManager.getInstance().setMusicVolume(1);

    }

    // update (dt) {}
}
