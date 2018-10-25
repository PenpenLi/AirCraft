import PopupView from "../view/PopupView";
import ViewManager from "../../Common/ViewManager";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import HttpCtr from "../../Controller/HttpCtr";
import Util from "../../Common/Util";
import WXCtr from "../../Controller/WXCtr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginAward extends cc.Component {
    @property(cc.Label)
    lbDays: cc.Label = null;
    @property(cc.Label)
    lbFriends: cc.Label = null;
    @property(cc.Label)
    lbTotal: cc.Label = null;
    @property(cc.Node)
    ndDiamond: cc.Node = null;
    @property(cc.Node)
    ndGold: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.setAwardDatas();
    }

    setAwardDatas() {
        HttpCtr.getLoginAwardList((res) => {
            let data = res.data;
            let total = res.todaySum+res.pySum;
            this.lbDays.string = "连续签到"+res.todaySum+"日登陆奖励+"+res.todaySum+"倍";
            this.lbFriends.string = "共邀请"+res.pySum+"位好友，奖励+"+res.pySum+"倍";
            this.lbTotal.string = "今日签到奖励："+total+"倍!";
            let lbTimes;
            let lbNum;
            lbTimes = Util.findChildByName("lbTimes", this.ndDiamond).getComponent(cc.Label);
            lbTimes.string = total+"";
            lbNum = Util.findChildByName("lbNum", this.ndDiamond).getComponent(cc.Label);
            lbNum.string = data.moeny+"";

            lbTimes = Util.findChildByName("lbTimes", this.ndGold).getComponent(cc.Label);
            lbTimes.string = total+"";
            lbNum = Util.findChildByName("lbNum", this.ndGold).getComponent(cc.Label);
            lbNum.string = data.gold+"";
        });
    }

    invite() {
        WXCtr.share({
            invite: true
        });
    }

    signIn(event) {
        let btn = event.target.getComponent(cc.Button);
        btn.interactable = false;
        HttpCtr.sign((res) => {
            btn.interactable = true;
            if (res) {
                if(res.data){
                    GameData.diamonds += res.data.money;
                    GameData.gold += res.data.gold;
                    GameCtr.ins.mGame.setDiamonds();
                    ViewManager.toast("签到成功");
                }else{
                    ViewManager.toast(res.msg);
                }
            }
        });
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
