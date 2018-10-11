/**
 * 游戏界面
 * 游戏逻辑自己实现
 */

import GameCtr from "../../Controller/GameCtr";
import NodePoolManager from "../../Common/NodePoolManager";
import Apron from "./Apron";
import LandPlane from "./LandPlane";
import ViewManager from "../../Common/ViewManager";
import GameData from "../../Common/GameData";
import PlaneFrameMG from "./PlaneFrameMG";
import UpgradeView from "../view/UpgradeView";
import OffLineProfit from "../view/OffLineProfit";
import UnLockView from "../view/UnLockView";
import Guide from "./Guide";
import UserManager from "../../Common/UserManager";
import WXCtr from "../../Controller/WXCtr";
import AudioManager from "../../Common/AudioManager";


const { ccclass, property } = cc._decorator;

let posConfig = [
    [2, 2, 0, 0, 0],
    [2, 2, 1, 0, 0],
    [2, 2, 2, 0, 0],
    [2, 2, 2, 1, 0],
    [2, 2, 2, 2, 0],
    [3, 2, 2, 2, 0],
    [3, 3, 2, 2, 0],
    [3, 3, 3, 2, 0],
    [3, 3, 3, 3, 0],
    [3, 3, 3, 3, 1],
    [3, 3, 3, 3, 2],
    [3, 3, 3, 3, 3],
];

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    ndGame: cc.Node = null;
    @property(cc.Node)
    ndLoading: cc.Node = null;
    @property(cc.ProgressBar)
    pgbLoading: cc.ProgressBar = null;
    @property(cc.Node)
    ndDiamonds: cc.Node = null;
    @property(cc.Node)
    ndMoreGame: cc.Node = null;
    @property(cc.Node)
    ndCustom: cc.Node = null;

    @property(cc.Label)
    lbScore: cc.Label = null;
    @property(cc.Node)
    ndPlanes: cc.Node = null;
    @property(cc.Node)
    ndPlanePos: cc.Node = null;
    @property(cc.Prefab)
    pfLandPlane: cc.Prefab = null;
    @property(cc.Node)
    ndTrash: cc.Node = null;
    @property(cc.Node)
    ndExtend: cc.Node = null;
    @property(cc.Node)
    ndSignIn: cc.Node = null;
    @property(cc.Sprite)
    sprSlider: cc.Sprite = null;

    @property(cc.Node)
    ndBannerSlider: cc.Node = null;
    @property(cc.Node)
    ndFriendBtn: cc.Node = null;

    @property(cc.Prefab)
    pfUpgrade: cc.Prefab = null;
    @property(cc.Prefab)
    pfOffLineProfit: cc.Prefab = null;
    @property(cc.Prefab)
    pfUnlock: cc.Prefab = null;
    @property(cc.Prefab)
    pfInviteFriend: cc.Prefab = null;
    @property(cc.Prefab)
    pfLoginAward: cc.Prefab = null;

    private landPlanePool;
    private flyPlanePool;
    public goldParticlePool;
    public goldNumPool;

    public routePosArr = [];
    public flyPlaneArr = [];
    public landPlaneArr = [];

    public allPort = [];

    public allRunways = [];                         //所有跑道
    public runways = 0;                             //跑道总数
    public runwayUsed = 0;                          //使用的跑道数

    private ufoShowTimes = 0;
    private testSound = 1;
    private sliderIdx = 0;

    private lastGold = 0;

    onLoad() {
        GameCtr.getInstance().setGame(this);
        this.initPools();
        WXCtr.onShow(() => {
            WXCtr.isOnHide = false;
            this.scheduleOnce(() => {
                this.showOffLineProfitPop();
            }, 2.5);
        });
    }

    onDestroy() {
        WXCtr.offShow();
    }

    start() {
        // this.gameStart();
    }

    initPools() {
        this.landPlanePool = NodePoolManager.create(this.pfLandPlane);
    }

    gameStart() {
        GameCtr.isStartGame = true;
        WXCtr.getSelfData();
        WXCtr.getFriendRankingData();
        this.showLoading();
    }

    showLoading() {
        let pgb = this.ndLoading.getChildByName("pgbLoading").getComponent(cc.ProgressBar);
        pgb.node.active = true;
        let plane = pgb.node.getChildByName("plane");
        if (pgb.progress <= 1) {
            this.scheduleOnce(() => {
                plane.x = pgb.node.width * pgb.progress - (pgb.node.width / 2);
                pgb.progress += 0.015;
                this.showLoading();
            }, 0.02);
        } else {
            this.ndLoading.active = false;

            Guide.setGuideStorage(Guide.guideStep);
            GameCtr.playBgm();
            this.initGame();
            this.refreshGameBtns();
            WXCtr.createBannerAd(100, 300);
        }
    }

    initGame() {
        this.setDiamonds();
        this.showMoreGameBtn();
        setInterval(() => {
            if(WXCtr.isOnHide) return;
            GameData.submitGameData();
            GameCtr.dianmondNotice((resp) => {
                if (resp.moeny) {
                    GameData.diamonds += resp.moeny;
                    this.setDiamonds();
                }
            });
            WXCtr.createBannerAd(100, 300);
        }, 60000);
    }

    refreshGameBtns() {
        this.ndMoreGame.active = GameCtr.reviewSwitch;
        this.ndFriendBtn.active = GameCtr.reviewSwitch;
        this.showSlider();
        this.showBannerSlider();
    }

    showSignBtn() {
        this.ndSignIn.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.3, 1.1),
            cc.scaleTo(0.3, 1.0)
        )));
    }

    showMoreGameBtn() {
        this.ndMoreGame.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.5, 1.1),
            cc.scaleTo(0.5, 1.0)
        )));
    }

    setDiamonds() {
        let lbDiamonds = this.ndDiamonds.getChildByName("lbDiamonds").getComponent(cc.Label);
        lbDiamonds.string = GameData.diamonds + "";
    }

    //增加游戏分数
    addScore(num = 1) {
        GameCtr.addScore(num);
        this.lbScore.string = GameCtr.score + "";
    }

    showLandPort(level) {
        if (level > 11) {
            level = 11;
        }
        let info = posConfig[level];
        this.allPort = [];
        for (let i = 0; i < this.ndPlanePos.childrenCount; i++) {
            let num = info[i];
            let node = this.ndPlanePos.getChildByName(i + "");
            if (num > 0) {
                node.active = true;
                for (let k = 11; k < num + 11; k++) {
                    let nd = node.getChildByName(k + "");
                    let ndSke = nd.getChildByName("banzi")
                    ndSke.active = false;
                    nd.active = true;
                    nd.tag = i * 3 + k - 10;
                    this.allPort.push(nd);
                }
            }
        }

        this.setPortPlane();
    }

    setPortPlane() {
        for (let i = 0; i < this.allPort.length; i++) {
            let port = this.allPort[i];
            let level = GameData.getApronState(port.tag);
            if (level > 0) {
                this.setPlaneOnLand(level, port);
            }
        }

        this.showOffLineProfitPop();
    }


    addLandPlane(level, boxType = null) {
        let nd;
        let plane = this.landPlanePool.get();
        plane.scale = 0;
        for (let i = 0; i < this.allPort.length; i++) {
            let nd = this.allPort[i];
            let comp = nd.getComponent(Apron);
            if (comp.isUsed) {
                continue;
            } else {
                nd.addChild(plane);
                this.landPlaneArr.push(plane);
                let landPlane = plane.getComponent(LandPlane);
                landPlane.setLevel(level);
                landPlane.apronTag = nd.tag;
                comp.plane = landPlane;
                comp.isUsed = true;
                //设置对应停机坪状态
                GameData.setApronState(nd.tag, level);
                if (boxType) {
                    landPlane.showBox(boxType);
                    plane.position = cc.v2(0, 1600);
                    plane.scale = 1.0;
                    plane.runAction(cc.moveTo(0.5, cc.v2(0, 0)));
                } else {
                    plane.position = cc.v2(0, 0);
                    plane.runAction(cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut()));
                }

                return true;
            }
        }

        return false;
    }

    setPlaneOnLand(level, port) {
        let comp = port.getComponent(Apron);
        if (comp.isUsed) return;
        let plane = this.landPlanePool.get();
        port.addChild(plane);
        plane.position = cc.v2(0, 0);
        this.landPlaneArr.push(plane);
        let landPlane = plane.getComponent(LandPlane);
        landPlane.setLevel(level);
        landPlane.apronTag = port.tag;
        comp.plane = landPlane;
        comp.isUsed = true;
        
    }

    showTrash() {
        let trash = this.ndTrash.getChildByName("icon_trash");
        trash.opacity = 255;
    }

    hideTrash() {
        let trash = this.ndTrash.getChildByName("icon_trash");
        trash.opacity = 180;
    }

    //显示合成飞机粒子
    showExpParticle(wPos) {
        let expParticle = this.ndGame.getChildByName("ExpParticle").getComponent(cc.ParticleSystem);
        wPos = this.ndGame.convertToNodeSpaceAR(wPos);
        expParticle.node.position = wPos;
        expParticle.resetSystem();
    }

    showPortLight(port) {
        let ndSke = port.getChildByName("banzi");
        ndSke.active = true;
        let ske = ndSke.getComponent(sp.Skeleton);
        ske.setAnimation(0, "animation", false);
    }


    showGuide() {
        if (Guide.guideStep <= 7) {
            return;
        }
        Guide.show();
    }

    /**
     * 显示商店
     */
    showMall() {
        if (Guide.guideStep <= 7) {
            return;
        }
        GameCtr.clickStatistics(GameCtr.StatisticType.MALL);                               //商城点击统计
        ViewManager.showMall();
    }

    addFreeMallPlane() {
        if (this.addLandPlane(GameCtr.freeMallPlaneLevel, "buyGift")) {
            GameCtr.freeMallPlaneNum--;
        }
    }

    addUFOGiftBox() {
        let num = GameCtr.leftUfoBox;
        for (let i = 0; i < num; i++) {
            if (this.addLandPlane(GameCtr.UfoBoxLevel, "ufoGift")) {
                GameCtr.leftUfoBox--;
            }
        }
    }


    removeLandPlane(node) {
        let idx = this.landPlaneArr.indexOf(node);
        this.landPlaneArr.splice(idx, 1);
    }


    /**
     * 显示升级弹窗
     */
    showUpgrade(level) {
        let nd = cc.instantiate(this.pfUpgrade);
        let comp = nd.getComponent(UpgradeView);
        ViewManager.showPromptDialog({
            node: nd,
            title: "升级啦",
            closeButton: true,
            transition: false
        });
        comp.setLevel(level);
    }

    /**
     * 显示离线收益弹窗
     */
    showOffLineProfitPop() {
        console.log("离线收益！！！！！！");
        let profit = GameData.profit;
        WXCtr.getStorageData("lastTime", (resp) => {
            if (resp) {
                let lastTime = resp;
                let cTime = new Date().getTime();
                let offTime = Math.floor((cTime - lastTime) / 1000);
                let offLineProfit = Math.floor(GameData.profit * offTime * Math.pow(0.4, offTime / 28800));
                if (offTime > 2 * 60 && offLineProfit > 0) {
                    let nd = cc.instantiate(this.pfOffLineProfit);
                    let comp = nd.getComponent(OffLineProfit)
                    ViewManager.show({
                        node: nd,
                        closeOnKeyBack: true,
                        transitionShow: false,
                        maskOpacity: 200,
                        localZOrder: 1001
                    });
                    comp.setOffLineProfit(offTime, offLineProfit);
                    GameCtr.submitUserData({ data_4: cTime });
                    WXCtr.setStorageData("lastTime", cTime);
                } else {
                    this.autoShowLoginAward();
                }
            }
            else {
                this.autoShowLoginAward();
            }
        });
    }

    showOffLineProfitParticle() {
        let particle = this.ndGame.getChildByName("OffLineProfitParticle").getComponent(cc.ParticleSystem);
        particle.resetSystem();
        let particle1 = this.ndGame.getChildByName("OffLineProfitParticle1").getComponent(cc.ParticleSystem);
        particle1.resetSystem();
        // this.ndgold.runAction(cc.sequence(
        //     cc.delayTime(0.5),
        //     cc.repeat(
        //         cc.sequence(
        //             cc.scaleTo(0.1, 1.2),
        //             cc.scaleTo(0.05, 1)
        //         ), 5
        //     )
        // ))
    }

    /**
     * 显示解锁弹窗
     */
    showUnlockPop(level) {
        let nd = cc.instantiate(this.pfUnlock);
        let comp = nd.getComponent(UnLockView);
        ViewManager.showPromptDialog({
            node: nd,
            title: "解锁",
            closeButton: true,
            transition: false
        });
        comp.setData(level);
    }

    /**
     * 显示邀请好友界面
     */
    showInviteFriendPop() {
        if (Guide.guideStep <= 7) {
            return;
        }
        let nd = cc.instantiate(this.pfInviteFriend);
        ViewManager.show({
            node: nd,
            closeOnKeyBack: true,
            transitionShow: false,
            maskOpacity: 200
        });
    }

    //获取停机坪所有飞机的基础收益总和
    getAllPlaneBaseProfit() {
        let profits = 0;
        for (let i = 0; i < this.landPlaneArr.length; i++) {
            let node = this.landPlaneArr[i];
            let landPlane = node.getComponent(LandPlane);
            let profit = GameData.getBaseProfitOfPlane(landPlane.getLevel());
            profits += profit;
        }
        return profits;
    }

    /**
     * 更多游戏
     */
    showMoreGame() {
        if (Guide.guideStep <= 7) {
            return;
        }
        if (GameCtr.otherData) {
            WXCtr.gotoOther(GameCtr.otherData);
            GameCtr.clickStatistics(GameCtr.StatisticType.MORE_GAME, GameCtr.otherData.appid);                               //更多游戏点击统计
        }
    }

    openCustomService() {
        if (Guide.guideStep <= 7) {
            return;
        }
        GameCtr.clickStatistics(GameCtr.StatisticType.GIFT);                                    //关注礼包点击统计
        WXCtr.customService();
    }

    videoGift() {
        if (Guide.guideStep <= 7) {
            return;
        }

        let btn = this.ndCustom.getComponent(cc.Button);
        btn.interactable = false;
        GameCtr.clickStatistics(GameCtr.StatisticType.UFO);                               //UFO视频点击统计
        if (WXCtr.videoAd) {
            AudioManager.getInstance().stopAll();
            WXCtr.offCloseVideo();
            WXCtr.showVideoAd();
            WXCtr.onCloseVideo((res) => {
                GameCtr.playBgm();
                this.ndCustom.active = false;
                GameData.diamonds += 60;
                ViewManager.toast("恭喜获得60钻石奖励！");
                this.setDiamonds();
                WXCtr.setStorageData("everydayDiamonds", { day: GameCtr.getCurrTimeYYMMDD() });
            });
        }
    }

    /**
     * 排行榜
     */
    showRanking() {
        if (Guide.guideStep <= 7) {
            return;
        }
        ViewManager.showRanking();
        GameCtr.clickStatistics(GameCtr.StatisticType.RANKING);                               //排行榜点击统计
    }

    //自动弹出登录奖励
    autoShowLoginAward() {
        WXCtr.getStorageData("loginAwardData", (info) => {
            let day = GameCtr.getCurrTimeYYMMDD();
            if (!info) {
                this.showLoginAward();
                WXCtr.setStorageData("loginAwardData", { day: GameCtr.getCurrTimeYYMMDD() });
            }
            else if (info.day != day) {
                this.showLoginAward();
                WXCtr.setStorageData("loginAwardData", { day: GameCtr.getCurrTimeYYMMDD() })
            }
        });
    }

    //每日登录奖励
    showLoginAward() {
        if (Guide.guideStep <= 7) {
            return;
        }
        let nd = cc.instantiate(this.pfLoginAward)
        ViewManager.show({
            node: nd,
            name: "loginAward",
            closeOnKeyBack: true,
            transitionShow: false,
            maskOpacity: 200
        });
    }

    extendBtnChecked(toogle: cc.Toggle) {
        if (Guide.guideStep <= 7) {
            return;
        }
        let moveX = -106;
        if (toogle.isChecked) {
            moveX = 106;
        }
        toogle.interactable = false;
        this.ndExtend.runAction(cc.sequence(
            cc.moveBy(0.5, cc.v2(moveX, 0)),
            cc.callFunc(() => {
                toogle.interactable = true;
            })
        ))
    }

    audioChecked(toogle: cc.Toggle) {
        AudioManager.getInstance().musicOn = !toogle.isChecked;
        AudioManager.getInstance().soundOn = !toogle.isChecked;
    }

    showSlider() {
        if (!GameCtr.reviewSwitch || !GameCtr.sliderDatas) return;
        this.sprSlider.node.active = true;
        this.sprSlider.node.stopAllActions();
        this.sprSlider.node.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.5, 1.2),
            cc.scaleTo(0.5, 1.0)
        )));
        if (this.sliderIdx >= GameCtr.sliderDatas.length) this.sliderIdx = 0;
        let data = GameCtr.sliderDatas[this.sliderIdx];
        GameCtr.loadImg(this.sprSlider, data.img);
        this.scheduleOnce(() => {
            this.sliderIdx++;
            this.showSlider();
        }, 10);
    }

    clickslider() {
        if (Guide.guideStep <= 7) {
            return;
        }
        let data = GameCtr.sliderDatas[this.sliderIdx];
        WXCtr.gotoOther(data);
        GameCtr.clickStatistics(GameCtr.StatisticType.MORE_GAME, data.appid);
    }

    showBannerSlider() {
        if (!GameCtr.reviewSwitch || !GameCtr.bannerDatas) return;
        this.ndBannerSlider.active = true;
        let content = this.ndBannerSlider.getChildByName("content");
        for (let i = 0; i < content.childrenCount; i++) {
            let nd = content.children[i];
            let spr = nd.getComponent(cc.Sprite);
            GameCtr.loadImg(spr, GameCtr.bannerDatas[i].img);
        }
    }

    clickBannerSlider(event, idx) {
        let data = GameCtr.bannerDatas[idx];
        WXCtr.gotoOther(data);
        GameCtr.clickStatistics(GameCtr.StatisticType.BANNER_SLIDER, data.appid);                               //今日新游点击统计
    }

    showGiftBtn() {
        WXCtr.getStorageData("everydayDiamonds", (info) => {
            let day = GameCtr.getCurrTimeYYMMDD();
            if (GameData.maxPlaneLevel >= 7 && GameCtr.surplusVideoTimes > 0) {
                if (info && info.day != day) {
                    this.ndCustom.active = GameCtr.reviewSwitch;
                } else if (!info) {
                    this.ndCustom.active = GameCtr.reviewSwitch;
                }
            }
        });
    }
    // update (dt) {

    // }
}
