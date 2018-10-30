import GameData from "../../Common/GameData";
import PopupView from "./PopupView";
import HttpCtr from "../../Controller/HttpCtr";
import Util from "../../Common/Util";
import PlaneFrameMG from "../game/PlaneFrameMG";
import WXCtr from "../../Controller/WXCtr";
import ViewManager from "../../Common/ViewManager";
import GameCtr from "../../Controller/GameCtr";


const {ccclass, property} = cc._decorator;

const vipConfigs = [
    {diamonds: 1000, plane: 2},
    {diamonds: 1500, plane: 3},
    {diamonds: 2000, plane: 4},
    {diamonds: 1000, plane: 5},
    {diamonds: 1500, plane: 6},
    {diamonds: 2000, plane: 7},
];

@ccclass
export default class VIPPop extends cc.Component {

    @property(cc.Label)
    lbVipLevel: cc.Label = null;
    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Label)
    lbTitle: cc.Label = null;
    @property(cc.Label)
    lbDiamonds: cc.Label = null;
    @property(cc.Label)
    lbFactoryLevel: cc.Label = null;
    @property(cc.Sprite)
    sprPlane: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:
    private data;

    // onLoad () {}

    start () {
        HttpCtr.getInviteResult((res) => {
            this.data = res;
            this.setVipInfo();
        });
        
    }

    setVipInfo() {
        this.lbVipLevel.string = "贵宾"+(GameData.vipLevel+1);
        this.lbTitle.string = "贵宾"+(GameData.vipLevel+1)+"奖励";
        this.lbDiamonds.string = vipConfigs[GameData.vipLevel].diamonds+"钻石";
        this.lbFactoryLevel.string = "升至"+vipConfigs[GameData.vipLevel].plane+"级工厂";
        PlaneFrameMG.setPlaneFrame(this.sprPlane, vipConfigs[GameData.vipLevel].plane);
        this.setFriendInfo();
    }

    setFriendInfo() {
        if(!this.data) return;

        for(let i=0; i<this.ndContent.childrenCount; i++) {
            let item = this.ndContent.children[i];
            let data = this.data[i+(3*GameData.vipLevel)];
            if(!data) return;
            let lbName = item.getChildByName("lbName").getComponent(cc.Label);
            if(data.nick){
                lbName.string = data.nick;
            }else{
                lbName.string = "??????";
            }
            let sprHead = item.getChildByName("sprHead").getComponent(cc.Sprite);
            if(data.Icon){
                Util.loadImg(sprHead, data.Icon);
            }
        }
    }

    clickInvite() {
        WXCtr.share({invite: true});
    }

    getVipGift() {
        if(!this.data) {
            ViewManager.toast("不满足领取条件");
            return;
        }
        if(Math.floor(this.data.length/3) >= GameData.vipLevel+1) {
            GameData.vipLevel += 1;
            GameData.diamonds += vipConfigs[GameData.vipLevel].diamonds;
            GameCtr.ins.mGame.setDiamonds();
            for(let i=0; i<this.ndContent.childrenCount; i++) {
                let item = this.ndContent.children[i];
                let sprHead = item.getChildByName("sprHead").getComponent(cc.Sprite);
                sprHead.spriteFrame = null;
            }
            this.setVipInfo();
        }else{
            ViewManager.toast("不满足领取条件");
        }
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
