//全局控制类

import AudioManager from "../Common/AudioManager";
import WXCtr from "./WXCtr";
import Http from "../Common/Http";
import UserManager from "../Common/UserManager";
import Game from "../View/game/Game";
import Fight from "../View/fight/Fight";
import GameData from "../Common/GameData";
import ViewManager from "../Common/ViewManager";
import Start from "../View/start/Start";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtr {
    public static ins: GameCtr;
    public mGame: Game;
    public mStart: Start;
    public mFight: Fight;

    public static bannerId = null;

    public static score: number = 0;
    public static rankingEntrance = "Start";            //排行榜界面入口，默认开始界面

    public static friendsCircleImg = "";                //分享到朋友圈图片地址
    public static reviewSwitch = false;                 //审核开关

    public static lastZ = 10;

    static otherData = null;
    static sliderDatas = null;
    static bannerDatas = null;
    static shareSwitch = null;

    public static shareGoldTimes = 5;                           //剩余分享得金币次数
    public static freeShareGoldTimes = 10;                      //无限制分享的金币次数
    public static freeShareGoldCD = 10;                         //分享得金币冷却时间
    public static mall = null;

    public static leftUfoBox = 0;                          //剩余的ufo盒子
    public static UfoBoxLevel = 0;
    public static ufoProfitBuff = false;

    public static surplusVideoTimes = 6;                            //剩余看视频次数
    public static ufoDelayTime = 60;                                //UFO出现时间间隔

    public static IPONEX_HEIGHT=2436;                                                 
    public static isStartGame = false;                              //游戏是否已经开始

    public static onLineLastTime = null;
    public static OnClickStat = false;                              //点击统计开关，appid不受限制

    public static selfPlanes = [];                                   //个人飞机列表
    public static doubleAttack = false;                             //2倍攻击
    public static doubleGold = false;                               //2倍金币
    public static lotteryTimes=10;                                  //抽奖次数
    public static attactGoldRate=1;                                 //攻击倍率
    public static isSpeedUpModel = false;                           //是否是加速模式
    public static speedUpTime=0;                                    //加速时间
    public static musicSwitch=1;                                    //音乐、音效开关  1：开  -1:关    
    
    public static strikePool=null;                                  
    public static lbGoldPool=null;                
    public static lbHurtPool=null;
    public static enemyPoolArr=[];

    public static isFight=false;
    public static autoCompose=false;

    public static musicTag=-2000;
    public static gameToken=-1;

    public static fightStartGold=0;


    public static StatisticType = cc.Enum({                         //统计类型
        SPEED: 1,                                                   //加速分享
        INVITE: 2,                                                  //邀请
        MORE_GAME: 3,                                               //更多游戏
        UFO: 4,                                                     //UFO
        GIFT: 5,                                                    //关注礼包
        MALL: 6,                                                    //商城
        RANKING: 7,                                                 //排行榜
        FAST_BUY: 8,                                                //快捷购买
        SHARE_GOLD: 9,                                              //金币不足分享
        OFF_LINE_SHARE: 10,                                         //离线分享收益
        OFF_LINE_VEDIO: 11,                                         //离线视频收益
        BANNER_SLIDER: 12,                                          //今日新游统计
    });

    constructor() {
        GameCtr.ins = this;
        WXCtr.getLaunchOptionsSync();
        WXCtr.getSystemInfo();
        WXCtr.getAuthSetting();
        WXCtr.showShareMenu();
        WXCtr.getNetworkType();
        WXCtr.setVideoAd();
    }

    static getInstance() {
        if (!GameCtr.ins) {
            GameCtr.ins = new GameCtr();
        }
        return GameCtr.ins;
    }

    //设置game实例(游戏)
    setGame(game: Game) {
        this.mGame = game;
    }

    getGame(){
        return this.mGame;
    }

    //设置start实例（开始界面）
    setStart(start: Start) {
        this.mStart = start;
    }

    setFight(fight:Fight){
        this.mFight =fight;
    }

    getFight(){
        return this.mFight;
    }

    //场景切换
    static gotoScene(sceneName) {
        cc.director.loadScene(sceneName);
        AudioManager.getInstance().stopAll();
    }

    //显示排行榜
    static showRanking(entrance) {
        GameCtr.rankingEntrance = entrance;
        GameCtr.gotoScene("Ranking");
    }


    //播放背景音乐
    static playBgm() {
        AudioManager.getInstance().playMusic("audio/main_music", true);
    }

    //增加分数
    static addScore(num) {
        if (GameCtr.ins) {
            GameCtr.score += num;
        }
    }

    //获取广告配置 1.猜你喜欢  2.爆款游戏  3.游戏结束  4.游戏中
    static getAdList(data,type){
        let arr=[];
        for(let i=0;i<data.length;i++){
            if(data[i].status==type){
                arr.push(data[i])
            }
        }
        return arr
    }

}
