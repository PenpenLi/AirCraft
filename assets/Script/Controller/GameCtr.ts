//全局控制类

import AudioManager from "../Common/AudioManager";
import WXCtr from "./WXCtr";
import Http from "../Common/Http";
import UserManager from "../Common/UserManager";
import Game from "../View/game/Game";
import GameData from "../Common/GameData";
import ViewManager from "../Common/ViewManager";
import Start from "../View/start/Start";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameCtr {
    public static ins: GameCtr;
    public mGame: Game;
    public mStart: Start;

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

    public static freeMallPlaneNum = 0;
    public static freeMallPlaneLevel = 0;
    public static surplusFreeMallPlanes = 5;                        //剩余免费商店飞机数量
    public static lastFreeMallPlaneTime = 0;                        //上次领取免费商店飞机时间
    public static shareMax = 0;                                     //分享无限制等级上限

    public static isStartGame = false;                              //游戏是否已经开始

    public static onLineLastTime = null;
    public static OnClickStat = false;                              //点击统计开关，appid不受限制

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

    //设置start实例（开始界面）
    setStart(start: Start) {
        this.mStart = start;
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
        AudioManager.getInstance().playMusic("audio/bgm", true);
    }

    //增加分数
    static addScore(num) {
        if (GameCtr.ins) {
            GameCtr.score += num;
        }
    }



    //发送分数到游戏服务器
    static sendScore() {
        Http.send({
            url: Http.UrlConfig.SEND_SCROE,
            success: (resp) => {
                if (resp.data.circle_image) {
                    GameCtr.friendsCircleImg = resp.data.circle_image;
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                score: GameCtr.score
            }
        });
    }

    //登录游戏
    static login(code) {
        console.log("登陆服务器, code = ", code);
        Http.send({
            url: Http.UrlConfig.LOGIN,
            success: (resp) => {
                console.log("登陆服务器成功", resp);
                if (resp.success == Http.Code.OK) {
                    if (resp.data) {
                        UserManager.user_id = resp.data.uid;
                        UserManager.voucher = resp.data.voucher;
                        GameCtr.getUserInfo();
                        GameCtr.chanelCheck(WXCtr.launchOption.query, UserManager.user_id);
                        GameCtr.channelGift(WXCtr.launchOption.query);
                        GameCtr.getShareConfig();
                        GameCtr.getGameConfig();
                        GameCtr.getAdConfig();
                        GameCtr.invitedByFriend(WXCtr.launchOption.query);
                    } else {
                        WXCtr.showModal({
                            title: "提示",
                            content: "网络连接失败,请检查网络连接！",
                            confirmText: "确定"

                        });
                    }
                }
            },
            error: () => {
                WXCtr.showModal({
                    title: "提示",
                    content: "网络连接失败,请检查网络连接！",
                    confirmText: "确定"

                });
            },
            data: {
                code: code
            }
        });

    }

    //保存自己的信息（头像，昵称等）到服务器
    static saveUserInfo(data) {
        Http.send({
            url: Http.UrlConfig.SAVE_INFO,
            data:
                {
                    uid: UserManager.user_id,
                    voucher: UserManager.voucher,
                    encryptedData: data.encryptedData,
                    iv: data.iv
                },
            success: () => {
            }
        });
    }

    //获取游戏相关配置（审核开关等）
    static getGameConfig() {
        Http.send({
            url: Http.UrlConfig.GET_SETTING,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    GameCtr.reviewSwitch = resp.ok;
                    if (resp.nav.index) GameCtr.otherData = resp.nav.index;
                    if (resp.nav.nav) GameCtr.sliderDatas = resp.nav.nav;
                    if (resp.nav.banner) GameCtr.bannerDatas = resp.nav.banner;
                    if (resp.share) GameCtr.shareSwitch = resp.share;
                    if (resp.shareMax) GameCtr.shareMax = resp.shareMax;
                    if (resp.advTime) GameCtr.ufoDelayTime = resp.advTime;
                    if (resp.shareStart) GameCtr.freeShareGoldTimes = resp.shareStart;
                    if (resp.shareTime) GameCtr.freeShareGoldCD = resp.shareTime;
                    if (resp.onclick) GameCtr.OnClickStat = resp.onclick;

                    GameCtr.ins.mGame.refreshGameBtns();
                }
            },
            error: () => {
                setTimeout(() => { GameCtr.getGameConfig(); }, 5000);
            }
        });
    }

    //获取分享配置
    static getShareConfig() {
        Http.send({
            url: Http.UrlConfig.GET_SHARE,
            success: (resp) => {
                WXCtr.shareTitle = resp.data.share_title;
                WXCtr.shareImg = resp.data.share_img;
                WXCtr.setShareAppMessage();
            },
            data: {
                share_type: "index",
            },
            error: () => {
                setTimeout(() => { GameCtr.getShareConfig(); }, 5000);
            }
        });
    }

    //获取个人信息
    static getUserInfo(callBack = null) {
        // 个人信息，data_3表示上次保存数据到服务器时间戳， data_1表示新手引导步骤， data_4表示退到后台时间, data_5标示邀请好友数量, data_6退出游戏时间
        Http.send({
            url: Http.UrlConfig.GET_USERINFO,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    UserManager.user = resp.user;
                    if (callBack) {
                        callBack(resp.user);
                    } else {
                        GameCtr.compareData(resp.user);
                    }
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher
            },
            error: () => {
                GameCtr.getUserInfo(callBack);
            }
        });
    }

    static compareData(data) {
        if (!data.data_3) {
            GameData.getAllLocalGameData();
            console.log("1111111111111111")
        } else {
            console.log("data.data_3 == ", data.data_3);
            WXCtr.getStorageData("saveTime", (saveTime) => {
                if (saveTime) {
                    console.log("saveTime ==", saveTime);
                    if (data.data_3 > saveTime) {
                        GameData.getOnlineGameData(data);
                        console.log("222222222222222:", data.data_3 - saveTime)
                    } else {
                        GameData.getAllLocalGameData();
                        console.log("44444444444444444")
                    }
                } else {
                    GameData.getOnlineGameData(data);
                    console.log("5555555555555")
                }
            });
        }

        if (data.data_6) {
            GameCtr.onLineLastTime = data.data_6;
        }
    }

    //上传个人信息
    static submitUserData(data) {
        let sendData = {
            uid: UserManager.user_id,
            voucher: UserManager.voucher
        };
        for (let key in data) {
            sendData[key] = data[key];
        }
        sendData["data_3"] = new Date().getTime();
        sendData["data_6"] = new Date().getTime();
        Http.send({
            url: Http.UrlConfig.SET_DATA,
            success: (resp) => {
            },
            data: sendData
        });
        GameData.setUserData({});
    }

    //获取离线收益
    static getOffLineProfit() {
        Http.send({
            url: Http.UrlConfig.OFFLINE_PROFIT,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    GameData.offLineProfit = resp.gold;
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher
            }
        });
    }

    //帮助加速
    static helpSpeedUp(query) {
        if (query.speed) {
            Http.send({
                url: Http.UrlConfig.HELP_SPEED_UP,
                success: () => {
                },
                data: {
                    uid: UserManager.user_id,
                    voucher: UserManager.voucher,
                    touid: query.speed
                }
            });
        }
    }

    //查询加速信息
    static getSpeedUpInfo(callBack = null) {
        Http.send({
            url: Http.UrlConfig.GET_SPEED_UP_INFO,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    if (callBack) {
                        callBack(resp.data);
                    }
                    GameData.diamonds = resp.data.money;
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            }
        });
    }

    //删除加速信息
    static deleteSpeedUpInfo(toUid, callBack) {
        Http.send({
            url: Http.UrlConfig.DELETE_SPEED_UP_INFO,
            success: () => {
                if (callBack) {
                    callBack();
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                touid: toUid
            }
        });
    }

    // 邀请好友得钻石
    static invitedByFriend(query) {
        Http.send({
            url: Http.UrlConfig.INVITE_FRIEND,
            success: () => { },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                touid: query.invite
            }
        });
    }


    // 查询邀请好友结果
    static getInviteResult(callBack = null) {
        Http.send({
            url: Http.UrlConfig.GET_INVITE_INFO,
            // method: "GET",
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    if (callBack) {
                        callBack(resp.data);
                    }
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            }
        });
    }

    //分享到群检测
    static shareGroupCheck(encryptedData, iv, callback) {
        Http.send({
            url: Http.UrlConfig.SHARE_GROUP,
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                encrypted_data: encryptedData,
                iv: iv

            },
            success: (resp) => {
                if (resp.ret == 1) {
                    if (callback) {
                        callback();
                    }
                } else if (resp.ret == 0) {
                    ViewManager.toast(resp.msg);
                }
            }
        });
    }


    //渠道验证
    static chanelCheck(query, userId) {
        Http.send({
            url: Http.UrlConfig.CHANEL_RECORD,
            data: {
                uid: userId,
                voucher: UserManager.voucher,
                channel_id: query.channel_id,
                cuid: query.cuid,
                cvoucher: query.cvoucher,
                cid: query.cid,
                pid: query.pid
            },
            success: (resp) => {
            },
            error: () => {
                setTimeout(() => { GameCtr.chanelCheck(query, userId); }, 5000);
            }
        });
    }

    //关注福利
    static channelGift(query) {
        if (query.channel_id == 88 && query.guanzu) {
            WXCtr.getStorageData("guanzhufuli", (flag) => {
                if (!flag) {
                    WXCtr.setStorageData("guanzhufuli", true);
                    GameData.diamonds += 100;
                }
            });
        }
    }

    static videoCheck(query) {
        Http.send({
            url: Http.UrlConfig.VideoOpen,
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                channel_id: query.channel_id,
                cuid: query.cuid,
                cvoucher: query.cvoucher,
                cid: query.cid,
                pid: query.pid
            }
        });
    }


    static getFriendsCircleGold() {
        setTimeout(() => { GameCtr.getGold("circle"); }, 30000);
    }

    //获取金币
    static getGold(method) {
        Http.send({
            url: Http.UrlConfig.GET_GOLD,
            success: (resp) => {
                // GameCtr.ins.mRevive.getUserInfo();
            },
            data: {
                uid: UserManager.user_id,
                method: method
            }
        });
    }

    //钻石增加通知
    static dianmondNotice(callback) {
        Http.send({
            url: Http.UrlConfig.Diamond_NOTICE,
            success: (resp) => {
                callback(resp);
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            }
        });
    }

    //获取世界排行
    static getWorldRankingList(callBack) {
        Http.send({
            url: Http.UrlConfig.GET_WORLDLIST,
            success: (resp) => {
                callBack(resp);
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
                type: "gold"
            }
        });
    }

    //获取广告配置
    static getAdConfig() {
        Http.send({
            url: Http.UrlConfig.ADConfig,
            success: (res) => {
                if (res.data.videoid) {
                    WXCtr.setVideoAd(res.data.videoid);
                }
                if (res.data.advid) {
                    WXCtr.bannerId = res.data.advid;
                }
                if (res.banner) {
                    WXCtr.getStorageData("VideoTimes", (info) => {
                        let day = GameCtr.getCurrTimeYYMMDD();
                        if (!info) {
                            GameCtr.surplusVideoTimes = res.banner;
                        } else {
                            if (info.day == day) {
                                GameCtr.surplusVideoTimes = info.times;
                            } else {
                                GameCtr.surplusVideoTimes = res.banner;
                            }
                        }
                    });
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            },
            error: () => {
                setTimeout(() => { GameCtr.getAdConfig(); }, 5000);
            }
        });
    }

    //点击统计
    static clickStatistics(id, appid = null) {
        if (appid || GameCtr.OnClickStat) {
            Http.send({
                url: Http.UrlConfig.CLICK_STATISTICS,
                success: () => { },
                data: {
                    uid: UserManager.user_id,
                    voucher: UserManager.voucher,
                    clickid: id,
                    appid: appid
                }
            });
        }
    }

    //获取登录奖励列表
    static getLoginAwardList(callback) {
        Http.send({
            url: Http.UrlConfig.GET_LOGINAWARD,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    callback(resp);
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            }
        });
    }

    //领取登录奖励
    static sign(callback) {
        Http.send({
            url: Http.UrlConfig.SIGN_IN,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    callback(resp);
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            }
        });
    }

    //根据图片路径设置sprite的spriteFrame
    static loadImg(spr, imgUrl) {
        cc.loader.load({
            url: imgUrl,
            type: 'png'
        }, (err, texture) => {
            spr.spriteFrame = new cc.SpriteFrame(texture);
        });
    }

    //裁剪字符串，超出指定长度之后显示...(每个中文字符长度为2）
    static cutstr(str, len) {
        let str_length = 0;
        let str_len = 0;
        let str_cut = new String();
        str_len = str.length;
        for (var i = 0; i < str_len; i++) {
            let a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4 
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length > len) {
                str_cut = str_cut.concat("...");
                return str_cut;
            }
        }
        // //如果给定字符串小于指定长度，则返回源字符串； 
        // if (str_length < len) {
        //     return str;
        // }
        return str;
    }

    //获取年月日,格式为:2017-05-06
    static getCurrTimeYYMMDD() {
        var time: string = "";
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month;
        if ((myDate.getMonth() + 1) < 10) {
            month = "0" + (myDate.getMonth() + 1);
        } else {
            month = myDate.getMonth() + 1;
        }
        var day;
        if (myDate.getDate() < 10) {
            day = "0" + myDate.getDate();
        } else {
            day = myDate.getDate();
        }

        time = year + "-" + month + "-" + day;
        return time;
    }

    static followNode(srcNode: cc.Node, targetNode: cc.Node) {
        let wTPos = targetNode.parent.convertToWorldSpaceAR(targetNode.getPosition());
        let sPos = srcNode.parent.convertToNodeSpace(wTPos);
        srcNode.position = sPos;
    }

    static formatNum(value, digit = 6) {
        value = Math.floor(value);
        if (value >= Math.pow(10, digit) && value < Math.pow(10, digit + 3)) {
            value = Math.floor(value / 1000);
            value = this.getString(value) + "k";
        }
        else if (value >= Math.pow(10, digit + 3) && value < Math.pow(10, digit + 6)) {
            value = Math.floor(value / 1000000);
            value = this.getString(value) + "M";
        }
        else if (value >= Math.pow(10, digit + 6)) {
            value = Math.floor(value / 1000000000);
            value = this.getString(value) + "B";
        } else if (value >= Math.pow(10, digit + 9)) {
            value = Math.floor(value / 1000000000000);
            value = this.getString(value) + "AA";
        }
        else {
            value = this.getString(value);
        }
        return value;
    }

    static getString(num) {
        var num = (num || 0).toString(), result = '';
        let intStr = num;

        while (intStr.length > 3) {
            result = ',' + intStr.slice(-3) + result;
            intStr = intStr.slice(0, intStr.length - 3);
        }
        if (intStr) { result = intStr + result; }
        return result;
    }

    private static toFloat(value, fractionDigits = 3) {
        try {
            let f = fractionDigits;
            let ret = f ? (value.toString().replace(new RegExp("([0-9]+\.[0-9]{" + f + "})[0-9]*", "g"), "$1") * 1) : (value * 1);
            return isNaN(ret) ? value : ret.toFixed(fractionDigits);
        } catch (e) {
            return value * 1;// 防止小数位数字越界  
        }
    }
}
