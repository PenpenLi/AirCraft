import WXCtr from "../../Controller/WXCtr";
import PopupView from "./PopupView";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import AudioManager from "../../Common/AudioManager";
import ViewManager from "../../Common/ViewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UFOGift extends cc.Component {

    @property(cc.Node)
    ndBox: cc.Node = null;
    @property(cc.Node)
    ndGold: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    private giftType = 1;                               //0,盒子； 1,金币
    private isVideoClicked = false;

    onLoad() {
        this.setType();
    }

    onDestroy() {
    }

    start() {

    }

    setType() {
        this.giftType = Math.floor(Math.random() * 2);
        if (this.giftType == 1) {
            this.ndGold.active = true;
        } else {
            this.ndBox.active = true;
        }
    }

    clickVedioBtn() {
        if(this.isVideoClicked) return;
        GameCtr.clickStatistics(GameCtr.StatisticType.UFO);                               //UFO视频点击统计
        this.isVideoClicked = true;
        if (WXCtr.videoAd) {
            AudioManager.getInstance().stopAll();
            WXCtr.offCloseVideo();
            WXCtr.showVideoAd();
            WXCtr.onCloseVideo((res) => {
                GameCtr.playBgm();
                this.sendGift(res);
            });
        }
    }

    sendGift(statue) {
        if (!statue) {
            this.close();
            return;
        }
        if (this.giftType == 1) {
            GameCtr.ufoProfitBuff = true;
            GameCtr.ins.mGame.showGoldRain();
        } else {
            GameCtr.leftUfoBox = 4;
            let maxLevel = GameData.maxPlaneLevel;
            GameCtr.UfoBoxLevel =  Math.floor((Math.random() * 10 + 70) / 100 * maxLevel * Math.pow(0.9, maxLevel / 30));
            if(maxLevel > 15){
                if (maxLevel - GameCtr.UfoBoxLevel < 4) {
                    GameCtr.UfoBoxLevel = maxLevel - 4;
                }
            }else{
                if (maxLevel - GameCtr.UfoBoxLevel < 3) {
                    GameCtr.UfoBoxLevel = maxLevel - 3;
                }
            }
            if(GameCtr.UfoBoxLevel < 1) GameCtr.UfoBoxLevel = 1; 

            
            GameCtr.ins.mGame.addUFOGiftBox();
        }
        this.close();
    }

    close() {
        if (!this.node.parent) {
            return;
        }
        let popupView = this.node.parent.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
        AudioManager.getInstance().setSoundVolume(1);
        AudioManager.getInstance().setMusicVolume(1);
    }

}
