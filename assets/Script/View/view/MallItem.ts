import GameData from "../../Common/GameData";
import GameCtr from "../../Controller/GameCtr";
import PlaneFrameMG from "../game/PlaneFrameMG";
import WXCtr from "../../Controller/WXCtr";
import AudioManager from "../../Common/AudioManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MallItem extends cc.Component {

    @property(cc.Label)
    lbPrice: cc.Label = null;

    @property(cc.Sprite)
    spr: cc.Sprite = null;

    @property(cc.ProgressBar)
    pgbEarn: cc.ProgressBar = null;
    @property(cc.ProgressBar)
    pgbSpeed: cc.ProgressBar = null;

    @property(cc.Button)
    btnGold: cc.Button = null;
    @property(cc.Button)
    btnDiamonds: cc.Button = null;
    @property(cc.Button)
    btnDisable: cc.Button = null;
    @property(cc.Button)
    btnShare: cc.Button = null;
    @property(cc.Button)
    btnVideo: cc.Button = null;

    // onLoad () {}
    public price = 0;
    public maxSpeed = 0;

    private diamonds = 0;
    private level = 0;
    private times = 0;

    start() {

    }

    setData(data) {
        this.maxSpeed = 5 * (1 - Math.pow(0.001, (1 / GameData.maxPlane)));
        this.level = data.level;
        this.times = data.times;
        this.setFrame(data.level);
        this.setPgbProgress(data.level);
        if (data.level <= GameData.maxPlaneLevel) {
            if (data.level >= GameData.maxPlaneLevel - 3 && data.level <= GameData.maxPlaneLevel - 2) {
                this.showDiamondsBtn(data.level);
            } else if (data.level < GameData.maxPlaneLevel - 3) {
                this.showGoldBtn();
                this.setPrice(data.level, data.times);
            } else if (data.level > GameData.maxPlaneLevel - 2) {
                this.showDisableBtn(data.level);
            }
        } else {
            this.disableItem(data.level);
        }
    }

    setFrame(level) {
        PlaneFrameMG.setPlaneFrame(this.spr, level, "land");
    }

    disableItem(level) {
        this.spr.node.color = cc.color(0, 0, 0);
        this.pgbEarn.progress = 0;
        this.pgbEarn.node.color = cc.color(125, 125, 125);
        this.pgbSpeed.progress = 0;
        this.pgbSpeed.node.color = cc.color(125, 125, 125);
        this.showDisableBtn(level);
    }

    showDisableBtn(level) {
        this.btnGold.node.active = false;
        this.btnDiamonds.node.active = false;
        this.btnShare.node.active = false;
        this.btnVideo.node.active = false;
        this.btnDisable.node.active = true;
        let lbLevel = this.btnDisable.node.getChildByName("lbLevel").getComponent(cc.Label);
        if (level > GameData.maxPlaneLevel) {
            level = "???"
        } else {
            level += 4;
        }
        lbLevel.string = level + "";
    }

    showShareBtn() {
        WXCtr.getStorageData("mallFreePlanes", (info) => {
            if (GameCtr.surplusVideoTimes > 0) {
                this.btnVideo.node.active = true;
                return;
            }
            let day = GameCtr.getCurrTimeYYMMDD();
            if (info && info.day == day) {
                GameCtr.surplusFreeMallPlanes = info.times;
            }
            if (GameCtr.surplusFreeMallPlanes > 0 && GameCtr.reviewSwitch) {
                this.btnShare.node.active = true;
            }
        });
    }

    showGoldBtn() {
        this.btnGold.node.active = true;
        this.btnDiamonds.node.active = false;
        this.btnDisable.node.active = false;
        this.btnShare.node.active = false;
        this.btnVideo.node.active = false;
    }

    enableGoldBtn(isAble) {
        let btn = this.btnGold.getComponent(cc.Button);
        btn.interactable = isAble;
    }

    showDiamondsBtn(level) {
        this.btnGold.node.active = false;
        this.btnDiamonds.node.active = true;
        this.btnDisable.node.active = false;
        this.btnShare.node.active = false;
        this.btnVideo.node.active = false;
        let lbDiamonds = this.btnDiamonds.node.getChildByName("lbDiamonds").getComponent(cc.Label);
        this.diamonds = Math.floor(level * 15 * (1 - Math.pow(0.2, (level / 45)))) + 1;
        lbDiamonds.string = this.diamonds + "";
    }

    setPrice(level, times) {
        this.price = GameData.getPriceOfPlane(level, times);
        this.lbPrice.string = GameCtr.formatNum(this.price);
    }


    setPgbProgress(level) {
        let ratio = level / GameData.maxPlane;
        this.pgbEarn.progress = ratio;

        let speed = GameData.getSpeedOfPlane(level);
        ratio = this.maxSpeed / speed;
        this.pgbSpeed.progress = ratio;
    }

    buyPlaneWithGold() {
        let flag = GameCtr.ins.mGame.buyPlane(this.level, "buyGift");
        if (flag) {
            this.setPrice(this.level, ++this.times);
        }
    }

    buyPlaneWithDiamonds() {
        GameCtr.ins.mGame.buyPlane(this.level, "buyGift", this.diamonds);
    }

    getPlaneByShare() {
        this.btnShare.node.active = false;
        WXCtr.share({
            callback: () => {
                GameCtr.freeMallPlaneNum++;
                GameCtr.freeMallPlaneLevel = this.level;
                GameCtr.ins.mGame.addFreeMallPlane();
                GameCtr.surplusFreeMallPlanes--;
                WXCtr.setStorageData("mallFreePlanes", { day: GameCtr.getCurrTimeYYMMDD(), times: GameCtr.surplusFreeMallPlanes });
                GameCtr.lastFreeMallPlaneTime = new Date().getTime();
            }
        });
    }

    getPlaneByVideo() {
        this.btnVideo.interactable = false;
        if (WXCtr.videoAd) {
            AudioManager.getInstance().stopAll();
            WXCtr.offCloseVideo();
            WXCtr.showVideoAd();
            WXCtr.onCloseVideo((res) => {
                GameCtr.playBgm();
                if (res) {
                    this.btnVideo.interactable = true;
                    this.btnVideo.node.active = false;
                    GameCtr.freeMallPlaneLevel = this.level;
                    GameCtr.ins.mGame.addFreeMallPlane();
                    GameCtr.lastFreeMallPlaneTime = new Date().getTime();
                }
            });
        }
    }

    // update (dt) {}
}
