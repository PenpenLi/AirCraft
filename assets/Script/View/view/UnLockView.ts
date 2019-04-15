import GameData from "../../Common/GameData";
import PlaneFrameMG from "../game/PlaneFrameMG";
import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";
import PopupView from "./PopupView";
import Util from "../../Common/Util";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UnLockView extends cc.Component {

    @property(cc.Node)
    ndLight: cc.Node = null;
    @property(cc.Sprite)
    sprPlane: cc.Sprite = null;
    @property(cc.Label)
    lbPrice: cc.Label = null;
    @property(cc.Node)
    ndVedioBtn: cc.Node = null;
    @property(cc.Node)
    ndDiamonds: cc.Node = null;
    // onLoad () {}

    private profit = 0;

    start () {

    }

    setData(level) {
        this.ndLight.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.repeat(cc.rotateBy(3.0, 360), 9999)
        )); 
        if (!WXCtr.videoAd || GameCtr.surplusVideoTimes <= 0) {
            this.ndVedioBtn.active = false;
        }
        this.ndDiamonds.active = GameCtr.reviewSwitch; 
        
        this.profit = GameData.planeGift[level];
        this.lbPrice.string = Util.formatNum(this.profit);

        PlaneFrameMG.setPlaneFrame(this.sprPlane, level);
        this.sprPlane.node.runAction(cc.scaleTo(1.0, 2.0).easing(cc.easeBounceOut()));
    }

    clickDiamonds() {
        WXCtr.share({
            profit: true,
            callback: () => {
                this.profit *= 2;
                this.close();
            }
        })
    }

    clickVedio() {
        if (WXCtr.videoAd) {
            WXCtr.showVideoAd();
            WXCtr.onCloseVideo((res) => {
                WXCtr.offCloseVideo();
                if (res) {
                    this.profit *= 3;
                }
                this.close();
            });
        }
    }

    close() {
        if (!this.node.parent) {
            return;
        }
        GameData.gold += this.profit;
        GameCtr.ins.mGame.setDiamonds();
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
