import PopupView from "../view/PopupView";
import ViewManager from "../../Common/ViewManager";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import HttpCtr from "../../Controller/HttpCtr";

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
            let idx = 0;
            let data = res.data;
        });
    }

    signIn(event) {
        let btn = event.target.getComponent(cc.Button);
        btn.interactable = false;
        HttpCtr.sign((res) => {
            btn.interactable = true;
            if (res) {
                
                let signedSum = res.todaySum;
                if(res.data){
                    GameData.diamonds += res.data.money;
                    GameCtr.ins.mGame.setDiamonds();
                    ViewManager.toast("恭喜获得"+res.data.money+"钻石！");
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
