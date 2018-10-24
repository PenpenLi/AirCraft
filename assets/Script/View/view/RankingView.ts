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


    private itemPages = 1;
    private pageSize = 5;
    private cellHeight = 182;
    private contentOrigin = 500;

    private dataList = [];

    private tex: cc.Texture2D = null;
    private curPage = 1;

    private adapter: ListAdapter;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.itemPages = 1;
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
            for(let key in resp.data) {
                this.dataList.push(resp.data[key]);
            }
            console.log("this.dataList == ", this.dataList);
            this.adapter.setDataSet(this.dataList);
            this.mListView.setAdapter(this.adapter);
        });
    }

    showSelf(top) {
        let ndSelf = this.ndWorld.getChildByName("ndSelf");
        let comp = ndSelf.getComponent(RankingCell);
        Util.loadImg(comp.sprHead, UserManager.user.icon);
        comp.lbName.string = UserManager.user.nick;
        // let lbLocation = ndSelf.getChildByName("lbLocation").getComponent(cc.Label);
        // lbLocation.string = UserManager.user.city;
        comp.lbGold.string = Util.formatNum(GameData.fightLevel);
        if(top < 3) {
            comp.lbRanking.node.active = false;
            comp.sprMedal.node.active = true;
            comp.sprMedal.spriteFrame = comp.medalsFrames[top];
        }else{
            comp.lbRanking.string = (top+1) + "";
        }
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
        if (this.curPage > 0) {
            WXCtr.showFriendRanking(this.curPage);
        }
    }

    clickPageBtn(event, type) {
        if (type == "last") {
            if (this.curPage > 1) {
                this.curPage--;
            } else {
                return;
            }
        } else if (type == "next") {
            if (this.curPage < 10) {
                this.curPage++;
            } else {
                return;
            }
        }
        // this.showFriendRanking();
        // this._updateSubDomainCanvas();
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
