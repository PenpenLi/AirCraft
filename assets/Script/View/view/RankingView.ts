import GameCtr from "../../Controller/GameCtr";
import RankingCell from "./RankingCell";
import WXCtr from "../../Controller/WXCtr";
import UserManager from "../../Common/UserManager";
import HttpCtr from "../../Controller/HttpCtr";
import Util from "../../Common/Util";


const { ccclass, property } = cc._decorator;

@ccclass
export default class RankingView extends cc.Component {

    @property(cc.Node)
    ndWorld: cc.Node = null;
    @property(cc.Node)
    ndWorldScr: cc.Node = null;
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
    @property(cc.Node)
    ndShareBtn: cc.Node = null;
    @property(cc.Prefab)
    pfRankingCell: cc.Prefab = null;


    private itemPages = 1;
    private pageSize = 5;
    private cellHeight = 182;
    private contentOrigin = 500;

    private dataList = {};

    private tex: cc.Texture2D = null;
    private curPage = 1;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.itemPages = 1;
        // this.tex = new cc.Texture2D();
        WXCtr.initSharedCanvas();
        this.reigsterTouch();
    }

    onDestroy() {
        // this.tex.releaseTexture();
        if (WXCtr.userInfoBtn && WXCtr.userInfoBtn.destroy) {
            WXCtr.userInfoBtn.destroy();
        }
    }

    start() {
        this.showWorld();
        this.showSelf();
        // this.schedule(() => { this._updateSubDomainCanvas(); }, 1);
        HttpCtr.getWorldRankingList((resp) => {
            this.dataList = resp.data;
            this.addItems();
        });
    }

    reigsterTouch() {
        // this.ndWorldScr.on(cc.Node.EventType.TOUCH_MOVE, this.onScrTouchMoved, this);
    }

    onScrTouchMoved(event) {
        if (this.ndContent.y > this.contentOrigin + (this.itemPages * this.pageSize - 6) * this.cellHeight) {
            if (this.itemPages < 5) {
                this.itemPages++;
                this.addItems();
            }
        }
    }

    addItems() {
        this.ndContent.removeAllChildren();
        let nd = cc.instantiate(this.pfRankingCell);
        for (let i = (this.curPage - 1) * this.pageSize+1; i <= this.curPage * this.pageSize; i++) {
            let data = this.dataList[i];
            if (!data) return;
            if (i > 50) return;
            let item = cc.instantiate(nd);
            item.active = true;
            this.ndContent.addChild(item);
            let comp = item.getComponent(RankingCell);
            comp.setData(data);
        }
    }

    

    showSelf() {
        let ndSelf = this.ndWorld.getChildByName("ndSelf");
        let sprHead = ndSelf.getChildByName("sprSelf").getComponent(cc.Sprite);
        Util.loadImg(sprHead, UserManager.user.icon);
        let lbName = ndSelf.getChildByName("lbName").getComponent(cc.Label);
        lbName.string = UserManager.user.nick;
        let lbLocation = ndSelf.getChildByName("lbLocation").getComponent(cc.Label);
        lbLocation.string = UserManager.user.city;
        let lbGold = ndSelf.getChildByName("lbGold").getComponent(cc.Label);
        lbGold.string = Util.formatNum(UserManager.user.gold);
    }

    showWorld() {
        this.ndWorld.active = true;
        if (!WXCtr.authed) {
            this.ndShareBtn.active = false;
            WXCtr.createUserInfoBtn();
            WXCtr.onUserInfoBtnTap((res) => {
                if (res) {
                    this.ndShareBtn.active = true;
                }
            });
        } else {
            this.ndShareBtn.active = true;
        }
    }

    clickToggle() {
        this.ndFirend.active = this.friendToggle.isChecked;
        let sprFirendChoosed = this.friendToggle.node.getChildByName("friend_choosed");
        sprFirendChoosed.active = this.friendToggle.isChecked;
        let sprFirendUnchoosed = this.friendToggle.node.getChildByName("friend_unchoosed");
        sprFirendUnchoosed.active = !this.friendToggle.isChecked;

        this.ndWorld.active = this.worldToggle.isChecked;
        let sprWorldChoosed = this.worldToggle.node.getChildByName("world_choosed");
        sprWorldChoosed.active = this.worldToggle.isChecked;
        let sprWorldUnchoosed = this.worldToggle.node.getChildByName("world_unchoosed");
        sprWorldUnchoosed.active = !this.worldToggle.isChecked;

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
            if(this.curPage < 10){
                this.curPage++;
            }else{
                return;
            }
        }
        this.addItems();
        // this.showFriendRanking();
        // this._updateSubDomainCanvas();
    }

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        // if (window.sharedCanvas != undefined && this.tex != null && this.ndFirend.active && this.sprFirend.node.active) {
        //     this.tex.initWithElement(window.sharedCanvas);
        //     this.tex.handleLoadedTexture();
        //     this.sprFirend.spriteFrame = new cc.SpriteFrame(this.tex);
        // }
    }
}
