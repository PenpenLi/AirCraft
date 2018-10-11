import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import PopupView from "./PopupView";
import ViewManager from "../../Common/ViewManager";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShareGold extends cc.Component {

    @property(cc.Label)
    lbGold: cc.Label = null;
    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onDestroy() {
        GameCtr.ins.mGame.enableFastBuyBtn(true);
    }

    start () {
        let profits = GameCtr.ins.mGame.getAllPlaneBaseProfit();
        this.lbGold.string = "+"+GameCtr.formatNum(profits*180);
    }

    share() {
        if (GameCtr.freeShareGoldTimes > 0) {
            GameCtr.clickStatistics(GameCtr.StatisticType.SHARE_GOLD);//上传统计信息
            WXCtr.share({
                callback: () => {
                    let profits = GameCtr.ins.mGame.getAllPlaneBaseProfit();
                    GameData.gold += profits * 180;
                    GameCtr.ins.mGame.setGold();
                    GameCtr.freeShareGoldTimes--;
                    this.close();
                }
            })
        }else{
            let lastTime = cc.sys.localStorage.getItem("lastTimefreeShareGoldCD");
            if (lastTime) {
                let cTime = new Date().getTime();
                let offTime = Math.floor((cTime - lastTime) / 1000);
                if(offTime>GameCtr.freeShareGoldCD){
                    GameCtr.clickStatistics(GameCtr.StatisticType.SHARE_GOLD);//上传统计信息
                    WXCtr.share({
                        callback: () => {
                            let profits = GameCtr.ins.mGame.getAllPlaneBaseProfit();
                            GameData.gold += profits * 180;
                            GameCtr.ins.mGame.setGold();
                            this.close();
                            cc.sys.localStorage.setItem("lastTimefreeShareGoldCD",new Date().getTime());
                        }
                    })
                }else{
                    ViewManager.toast("请"+GameCtr.freeShareGoldCD+"秒之后再次分享！");
                }
            }else{
                GameCtr.clickStatistics(GameCtr.StatisticType.SHARE_GOLD);//上传统计信息
                WXCtr.share({
                    callback: () => {
                        let profits = GameCtr.ins.mGame.getAllPlaneBaseProfit();
                        GameData.gold += profits * 180;
                        GameCtr.ins.mGame.setGold();
                        this.close();
                        cc.sys.localStorage.setItem("lastTimefreeShareGoldCD",new Date().getTime());
                    }
                })
            }
        }

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
    }

    // update (dt) {}
}
