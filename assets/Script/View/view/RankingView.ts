import GameCtr from "../../Controller/GameCtr";
import RankingCell from "./RankingCell";
import WXCtr from "../../Controller/WXCtr";
import UserManager from "../../Common/UserManager";
import HttpCtr from "../../Controller/HttpCtr";
import Util from "../../Common/Util";
import ListView, { AbsAdapter } from "./ListView";
import PopupView from "./PopupView";
import GrayEffect from "../../Common/GrayEffect";
import GameData from "../../Common/GameData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RankingView extends cc.Component {

    @property(cc.Node)
    ndWorld: cc.Node = null;
    @property(cc.Node)
    ndWorldScr: cc.Node = null;
    @property(ListView)
    mListView: ListView = null;
    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Node)
    ndFirend: cc.Node = null;
    @property(cc.Sprite)
    sprFirend: cc.Sprite = null;
    @property(cc.Toggle)
    friendToggle: cc.Toggle = null;
    @property(cc.Toggle)
    worldToggle: cc.Toggle = null;
    @property(cc.Prefab)
    pfRankingCell: cc.Prefab = null;

    private dataList = [];

    private tex: cc.Texture2D = null;

    private adapter: ListAdapter;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.tex = new cc.Texture2D();
        WXCtr.initSharedCanvas();
    }

    onDestroy() {
        this.tex.releaseTexture();
        if (WXCtr.userInfoBtn && WXCtr.userInfoBtn.destroy) {
            WXCtr.userInfoBtn.destroy();
        }
    }

    start() {
        this.adapter = new ListAdapter();
        this.showWorld();
        HttpCtr.getWorldRankingList((resp) => {
            this.showSelf(resp.metop);
            for (let key in resp.data) {
                this.dataList.push(resp.data[key]);
            }
            console.log("this.dataList == ", this.dataList);
            this.adapter.setDataSet(this.dataList);
            this.mListView.setAdapter(this.adapter);
        });
    }

    showSelf(top) {
        let ndSelf = this.ndWorld.getChildByName("ndSelf");
        if(top == 0) {
            ndSelf.active = false;
            return;
        }
        let comp = ndSelf.getComponent(RankingCell);
        WXCtr.wxGetUsrInfo((data) => {
            Util.loadImg(comp.sprHead, data.avatarUrl);
            comp.lbName.string = data.nickName;
            comp.lbGold.string = Util.formatNum(GameData.fightLevel);
            if (top < 3) {
                comp.lbRanking.node.active = false;
                comp.sprMedal.node.active = true;
                comp.sprMedal.spriteFrame = comp.medalsFrames[top-1];
            } else {
                comp.lbRanking.string = (top + 1) + "";
            }
        });


        // let lbLocation = ndSelf.getChildByName("lbLocation").getComponent(cc.Label);
        // lbLocation.string = UserManager.user.city;

    }

    showWorld() {
        this.ndWorld.active = true;
        // if (!WXCtr.authed) {
        //     WXCtr.createUserInfoBtn();
        //     WXCtr.onUserInfoBtnTap((res) => {
        //         if (res) {
        //             this.ndShareBtn.active = true;
        //         }
        //     });
        // } 
    }

    clickToggle() {
        console.log("click Toggle!!!!!!!!!!!!!!!");
        this.ndFirend.active = this.friendToggle.isChecked;
        this.ndWorld.active = this.worldToggle.isChecked;

        if (this.friendToggle.isChecked) {
            this.showFriendRanking();
            if (WXCtr.userInfoBtn && WXCtr.userInfoBtn.destroy) WXCtr.userInfoBtn.destroy();
        } else {
            WXCtr.closeFriendRanking();
            this.showWorld();
        }
    }

    share() {
        WXCtr.share();
    }

    showFriendRanking() {
        WXCtr.showFriendRanking();
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

    update() {
        this._updateSubDomainCanvas();
    }

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (window.sharedCanvas != undefined && this.tex != null && this.ndFirend.active && this.sprFirend.node.active) {
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.sprFirend.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }
}

class ListAdapter extends AbsAdapter<RankingCell> {
    constructor() {
        super(RankingCell);
    }
    updateView(comp: RankingCell, data: any) {
        comp.setData(this.getItem(data));
    }
}
