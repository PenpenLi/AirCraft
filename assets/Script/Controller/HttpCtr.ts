import Http from "../Common/Http";
import UserManager from "../Common/UserManager";
import WXCtr from "./WXCtr";
import GameCtr from "./GameCtr";
import ViewManager from "../Common/ViewManager";
import Util from "../Common/Util";
import GameData from "../Common/GameData";

/**
 * 所有Http请求统一控制
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class HttpCtr {

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

    private static loginRequestTimes = 0;                                  //登录请求次数

    //登录游戏
    static login(code) {
        console.log("登陆服务器, code = ", code);
        this.loginRequestTimes++;
        Http.send({
            url: Http.UrlConfig.LOGIN,
            success: (resp) => {
                console.log("登陆服务器成功", resp);
                if (resp.success == Http.Code.OK) {
                    if (resp.data) {
                        console.log("获取网络数据！！！！");
                        UserManager.user_id = resp.data.uid;
                        UserManager.voucher = resp.data.voucher;
                        HttpCtr.getUserInfo();
                        HttpCtr.chanelCheck(WXCtr.launchOption.query, code);
                        HttpCtr.getShareConfig();
                        HttpCtr.getGameConfig();
                        HttpCtr.getAdConfig();
                        HttpCtr.invitedByFriend(WXCtr.launchOption.query);
                    } else {
                        if(this.loginRequestTimes <= 3){
                            setTimeout(()=>{HttpCtr.login(code)}, 5000);
                        }else{
                            WXCtr.showModal({
                                title: "提示",
                                content: "网络连接失败,请检查网络连接！",
                                confirmText: "确定"
    
                            });
                        }
                    }
                }
            },
            error: () => {
                if(this.loginRequestTimes <= 3){
                    setTimeout(()=>{HttpCtr.login(code)}, 5000);
                }else{
                    WXCtr.showModal({
                        title: "提示",
                        content: "网络连接失败,请检查网络连接！",
                        confirmText: "确定"

                    });
                }
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
                    if (resp.advTime) GameCtr.ufoDelayTime = resp.advTime;
                    if (resp.onclick) GameCtr.OnClickStat = resp.onclick;
                }
            },
            error: () => {
                setTimeout(() => { HttpCtr.getGameConfig(); }, 5000);
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
                setTimeout(() => { HttpCtr.getShareConfig(); }, 5000);
            }
        });
    }

    //获取个人信息
    static getUserInfo(callBack = null) {
        // 个人信息，data_20表示上次保存数据到服务器时间戳， data_21退出游戏时间, data_1表示新手引导步骤, data_5标示邀请好友数量, 
        Http.send({
            url: Http.UrlConfig.GET_USERINFO,
            success: (resp) => {
                if (resp.success == Http.Code.OK) {
                    UserManager.user = resp.user;
                    if (callBack) {
                        callBack(resp.user);
                    } else {
                        HttpCtr.compareData(resp.user);
                    }
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher
            },
            error: () => {
                HttpCtr.getUserInfo(callBack);
            }
        });
    }

    static compareData(data) {
        // if (!data.data_20) {
            GameData.getAllLocalGameData();
            console.log("1111111111111111")
        // } else {
        //     console.log("data.data_20 == ", data.data_20);
        //     let saveTime = WXCtr.getStorageData("saveTime");
        //     if (saveTime) {
        //         console.log("saveTime ==", saveTime);
        //         if (data.data_20 > saveTime) {
        //             GameData.getOnlineGameData(data);
        //             console.log("222222222222222:", data.data_20 - saveTime)
        //         } else {
        //             GameData.getAllLocalGameData();
        //             console.log("44444444444444444")
        //         }
        //     } else {
        //         GameData.getOnlineGameData(data);
        //         console.log("5555555555555")
        //     }
        // }
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
        sendData["data_20"] = new Date().getTime();
        sendData["data_21"] = new Date().getTime();
        Http.send({
            url: Http.UrlConfig.SET_DATA,
            success: (resp) => {
            },
            data: sendData
        });
        // GameData.setUserData({});
    }

    // 邀请好友
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

    // 获取查询好友奖励
    // static getInviteGift(callBack = null) {
    //     Http.send({
    //         url: Http.UrlConfig.GET_INVITE_GIFT,
    //         success: (resp) => {
    //             if(callBack) {
    //                 callBack(resp);
    //             }
    //         },
    //         data: {
    //             uid: UserManager.user_id,
    //             voucher: UserManager.voucher,
    //         }
    //     });
    // }

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
    static chanelCheck(query, code) {
        // Http.send({
        //     url: Http.UrlConfig.CHANEL_RECORD,
        //     data: {
        //         uid: userId,
        //         voucher: UserManager.voucher,
        //         channel_id: query.channel_id,
        //         cuid: query.cuid,
        //         cvoucher: query.cvoucher,
        //         cid: query.cid,
        //         pid: query.pid
        //     },
        //     success: (resp) => {
        //     },
        //     error: () => {
        //         setTimeout(() => { HttpCtr.chanelCheck(query, userId); }, 5000);
        //     }
        // });
        if(window.wx){
            wx.request({
                url:"https://ball.yz071.com/api/?do=Ball.Api.Auth.WechatLogin",
                header:{
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    "x-source": "1000"
                },
                data: {
                    code: code,
                    channel: query.channel_id
                },
                method:'POST',
                success: (resp) => {
                    console.log("渠道验证成功beijing----", resp);
                },
                fail:{

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
                type: "level"
            }
        });
    }

    //获取广告配置
    static getAdConfig() {
        Http.send({
            url: Http.UrlConfig.ADConfig,
            success: (res) => {
                if (res.banner) {
                    let day = Util.getCurrTimeYYMMDD();
                    let obj = WXCtr.getStorageData("VideoTimes");
                    if (!obj) {
                        GameCtr.surplusVideoTimes = res.banner;
                    } else {
                        if (obj.day == day) {
                            GameCtr.surplusVideoTimes = obj.times;
                        } else {
                            GameCtr.surplusVideoTimes = res.banner;
                        }
                    }
                }
            },
            data: {
                uid: UserManager.user_id,
                voucher: UserManager.voucher,
            },
            error: () => {
                setTimeout(() => { HttpCtr.getAdConfig(); }, 5000);
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
    
    // update (dt) {}
}
