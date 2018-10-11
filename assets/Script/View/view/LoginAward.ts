import PopupView from "../view/PopupView";
import LoginAwardCell from "./LoginAwardCell";
import ViewManager from "../../Common/ViewManager";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginAward extends cc.Component {

    @property(cc.Node)
    ndContent: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.setAwardDatas();
    }

    setAwardDatas() {
        GameCtr.getLoginAwardList((res) => {
            let idx = 0;
            let data = res.data;
            let signedSum = res.todaySum;
            for (let key in data) {
                let info = data[key];
                let cell = this.ndContent.children[idx];
                let comp = cell.getComponent(LoginAwardCell);
                comp.setData(info);
                if (idx < signedSum) comp.signed();
                idx++;
            }
        });
    }

    signIn(event) {
        let btn = event.target.getComponent(cc.Button);
        btn.interactable = false;
        GameCtr.sign((res) => {
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
                for (let i = 0; i < this.ndContent.childrenCount; i++) {
                    if (i < signedSum) {
                        let cell = this.ndContent.children[i];
                        let comp = cell.getComponent(LoginAwardCell);
                        comp.signed();
                    }
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
