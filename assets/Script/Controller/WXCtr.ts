//微信全局方法

import GameCtr from "./GameCtr";
import Http from "../Common/Http";
import UserManager from "../Common/UserManager";
import ViewManager from "../Common/ViewManager";
import GameData from "../Common/GameData";
import HttpCtr from "./HttpCtr";
import Util from "../Common/Util";

const { ccclass, property } = cc._decorator;

enum Message_Type {
    Get_SelfData,                       //获取自己信息
    Get_FriendData,                     //获取好友排行榜数据
    Get_GroupData,                      //获取群排名
    Submit_SelfScore,                   //提交自己得分
    Compare_Score,                      //比较自己与好友得分
    Show_WholeRanking,                  //显示完整排行榜   
    Show_OverRanking,                   //显示结束排行榜
    Close_WholeRanking,                 //关闭好友排行
    Close_OverRanking,                  //关闭结束排行
};

const I6P = {
    w: 375.0,
    h: 667.0
};

@ccclass
export default class WXCtr {

    static wxLoginSuccess: boolean = false;
    static shareTitle;
    static shareImg;
    static videoAd = null;
    static videoId = "adunit-7ee7df6330093a1a";
    static videoAdCallback = null;
    static bannerAd = null;
    static bannerId = "adunit-667a190428db9263";
    static launchOption;
    static userInfoBtn = null;
    static gameClubBtn;

    static screenWidth;
    static screenHeight;
    static widthRatio;
    static heightRatio;

    static authed = false;
    static onShowCall = null;

    static isOnHide = false;

    constructor() {

    }

    //获取启动参数
    static getLaunchOptionsSync() {
        if (window.wx != undefined) {
            console.log("wx = ", wx);

            WXCtr.launchOption = window.wx.getLaunchOptionsSync();
            console.log("获取启动参数", WXCtr.launchOption);

            let fileMgr = wx.getFileSystemManager();
            fileMgr.getSavedFileList({
                success: (res) => {
                    console.log("获取本地缓存文件列表成功", res);
                },
            });

            wx.onHide(() => {
                console.log("退到后台！！！！！");
                let time = new Date().getTime();
                HttpCtr.submitUserData({ data_21: time });
                WXCtr.setStorageData("lastTime", time);
                WXCtr.isOnHide = true;
            });
        }
    }

    static getSystemInfo() {
        if (window.wx != undefined) {
            wx.getSystemInfo({
                success: (res) => {
                    WXCtr.screenWidth = res.screenWidth;
                    WXCtr.screenHeight = res.screenHeight;
                    WXCtr.widthRatio = WXCtr.screenWidth / I6P.w;
                    WXCtr.heightRatio = WXCtr.screenHeight / I6P.h;
                }
            });
        }
    }

    //退出当前小游戏
    static exitGame() {
        if (window.wx != undefined) {
            wx.exitMiniProgram();
        }
    }

    static getAuthSetting() {
        if (window.wx != undefined) {
            wx.getSetting({
                success: function (res) {
                    console.log("授权信息", res);
                    var authSetting = res.authSetting
                    if (authSetting['scope.userInfo'] === true) {
                        // 用户已授权
                        WXCtr.authed = true;
                    } else if (authSetting['scope.userInfo'] === false) {
                        // 用户已拒绝授权
                        WXCtr.authed = false;
                    } else {
                        // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
                        WXCtr.authed = false;
                    }
                }
            });
        }
    }

    //回到前台事件
    static onShow(callback) {
        if (window.wx != undefined) {
            let call: Function = () => {
                console.log("回到前台！！！");
                if (callback) {
                    callback();
                }
            }
            WXCtr.onShowCall = call;
            wx.onShow(WXCtr.onShowCall);
        }
    }

    static offShow() {
        if (window.wx != undefined) {
            if (WXCtr.onShowCall) {
                wx.offShow(WXCtr.onShowCall);
                WXCtr.onShowCall = null;
            }
        }
    }

    static loadSubPackages(name, callback = null) {
        if (window.wx != undefined && wx.loadSubpackage) {
            console.log("加载分包！！！！！！！！！！");
            let loadTask = wx.loadSubpackage({
                name: name, // name 可以填 name 或者 root
                success: function (res) {
                    // 分包加载成功后通过 success 回调
                    console.log("加载分包成功！！！！！！！！！！");
                    if (callback) {
                        callback();
                    }
                },
                fail: function (res) {
                    // 分包加载失败通过 fail 回调
                    console.log("加载分包失败！！！！！！！！！！");
                }
            });
            return loadTask;
        }
        return null;
    }

    //创建用户授权按钮
    static createUserInfoBtn() {
        if (window.wx != undefined && wx.createUserInfoButton) {
            console.log("创建用户授权按钮");

            WXCtr.userInfoBtn = wx.createUserInfoButton({
                type: 'image',
                image: 'res/raw-assets/resources/texture/authBtn.png',
                style: {
                    left: (WXCtr.screenWidth / 2) - (130 * WXCtr.widthRatio),
                    top: (WXCtr.screenHeight / 2) + (45 * WXCtr.widthRatio),
                    width: 260 * WXCtr.widthRatio,
                    height: 50 * WXCtr.heightRatio,
                } 
            });
        }
    }

    static onUserInfoBtnTap(callback) {
        if (!WXCtr.userInfoBtn) return;
        let call: Function = (res) => {
            if (res.userInfo) {
                WXCtr.wxGetUsrInfo();
                WXCtr.userInfoBtn.hide();
                WXCtr.authed = true;
                callback(true);
            } else {
                callback(false);
            }
        };
        WXCtr.userInfoBtn.onTap(call);
    }

    //设置转发信息（右上角按钮点击->转发）
    static setShareAppMessage() {
        if (window.wx != undefined) {
            wx.onShareAppMessage(function () {
                return {
                    title: WXCtr.shareTitle,
                    imageUrl: WXCtr.shareImg,
                }
            });
        }
    }

    static getNetworkType() {
        if (window.wx != undefined) {
            wx.getNetworkType({
                success: function (res) {
                    console.log("获取网络状态成功", res);
                    if (res.networkType != "none") {
                        WXCtr.wxOnLogin();
                    } else {
                        WXCtr.showModal({
                            title: "提示",
                            content: "网络连接失败,请检查网络连接！",
                            confirmText: "确定"

                        });
                    }
                },
                fail: function (res) {
                    console.log("获取网络状态失败", res);
                }
            });
        }
    }

    //登录微信
    static wxOnLogin() {
        if (window.wx != undefined) {
            //登录微信
            console.log("微信登录!!");
            
            window.wx.login({
                success: function (loginResp) {
                    HttpCtr.login(loginResp.code);
                },
                fail: function (res) {
                    console.log("微信登录失败!!");
                    // GameCtr.login(null);
                    WXCtr.showModal({
                        title: "提示",
                        content: "网络连接失败,请检查网络连接！",
                        confirmText: "确定"

                    });
                }
            })
        }
    }

    static showToast({
        title = "",
        icon = "none",
        image = null
    }) {
        if (window.wx != undefined) {
            wx.showToast({
                title: title,
                icon: icon,
                image: image
            });
        }
    }

    static showModal({
        title = "",
        content = null as string,
        confirmText = null as string
    }) {
        if (window.wx != undefined) {
            wx.showModal({
                title: title,
                content: content,
                showCancel: true,
                confirmText: confirmText,
                success: function (res) {
                    if (res.confirm) {
                        WXCtr.exitGame();
                    }
                }
            });
        }
    }

    static wxGetUsrInfo(callback = null) {
        if (window.wx != undefined) {
            window.wx.getUserInfo({
                openIdList: ['selfOpenId'],
                withCredentials: true,
                success: function (res) {
                    let info = res.userInfo;
                    WXCtr.authed = true;
                    HttpCtr.saveUserInfo(res);
                    if (callback) {
                        callback(info);
                    }
                },
                fail: function (res) {
                }
            })
        }
    }

    //创建游戏圈按钮
    static createGameClubBtn() {
        wx.getSystemInfo({
            success: (res) => {
                WXCtr.gameClubBtn = wx.createGameClubButton({
                    icon: 'dark',
                    style: {
                        left: (res.screenWidth / 2),
                        top: (res.screenHeight / 2) - 305 * (res.screenHeight / I6P.h),
                        width: 40,
                        height: 40
                    }
                });
            }
        });
    }

    //显示分享按钮
    static showShareMenu() {
        if (window.wx != undefined) {
            window.wx.showShareMenu({
                withShareTicket: true,
                success: (res) => {
                },
                fail: (res) => {
                    complete: (res) => {
                    }
                });
        }
    }

    //预览图片
    static previewImg(imgUrl) {
        if (window.wx != undefined) {
            wx.previewImage({
                urls: [imgUrl],
                success: (res) => {
                    console.log("预览图片成功回调", res);
                }
            });
        }
    }

    //保存图片到本地相册
    static saveImge(imgUrl, callback?: Function) {
        if (window.wx != undefined) {
            wx.downloadFile({
                url: "https://file.zxles.com/pyramidGame/official/public/pyramid-game.png",
                success: (resp) => {
                    console.log("下载图片成功", resp);
                    wx.saveImageToPhotosAlbum({
                        filePath: resp.tempFilePath,
                        success: (res) => {
                            console.log("图片保存到本地相册成功", res);
                            if (callback) {
                                callback(true);
                            }
                        }
                    });
                },
            });
        }
    }

    static setVideoAd() {
        if (window.wx != undefined && wx.createRewardedVideoAd) {
            WXCtr.videoAd = wx.createRewardedVideoAd({ adUnitId: WXCtr.videoId });
            WXCtr.videoAd.onLoad(() => {
            });
            WXCtr.videoAd.load();
            WXCtr.videoAd.onError(err => {
                console.log(err)
            });
        }
    }

    static showVideoAd() {
        if (WXCtr.videoAd) {
            WXCtr.videoAd.show();
            GameCtr.surplusVideoTimes--;
            console.log("今天剩余观看视频次数为：", GameCtr.surplusVideoTimes);
            WXCtr.setStorageData("VideoTimes", { day: Util.getCurrTimeYYMMDD(), times: GameCtr.surplusVideoTimes });
        }
    }

    static onCloseVideo(callback) {
        let call: Function = (res) => {
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                callback(true);
                HttpCtr.videoCheck(WXCtr.launchOption.query);
            }
            else {
                // 播放中途退出，不下发游戏奖励
                callback(false);
            }
        };
        WXCtr.videoAd.onClose(call);
        WXCtr.videoAdCallback = call;
    }

    static offCloseVideo() {
        if (WXCtr.videoAdCallback) {
            WXCtr.videoAd.offClose(WXCtr.videoAdCallback);
            WXCtr.videoAdCallback = null;
        }
    }

    //banner广告
    static createBannerAd(height = null, width = null) {
        if (window.wx != undefined && wx.createBannerAd) {
            if (WXCtr.bannerAd && WXCtr.bannerAd.destroy) {
                WXCtr.bannerAd.destroy();
            }
            let top = 140;
            if (height) top = height;
            let widthNum = 375;
            let left = 0;
            if (width) {
                widthNum = width;
                let realWidth = width * WXCtr.widthRatio;
                realWidth = realWidth < 300 ? 300 : realWidth;
                left = (WXCtr.screenWidth - realWidth) / 2;
            }
            WXCtr.bannerAd = wx.createBannerAd({
                adUnitId: WXCtr.bannerId,
                style: {
                    left: left,
                    top: WXCtr.screenHeight - top * WXCtr.heightRatio,
                    width: widthNum * WXCtr.widthRatio,
                }
            });
            WXCtr.bannerAd.show();
            WXCtr.bannerAd.onError(() => {
            })
        }
    }

    static showBannerAd() {
        if (WXCtr.bannerAd) {
            WXCtr.bannerAd.show();
        }
    }

    static hideBannerAd() {
        if (WXCtr.bannerAd && WXCtr.bannerAd.destroy) {
            WXCtr.bannerAd.destroy();
        }
    }

    //分享 
    static share(data?: {
        revive?: boolean,
        runway?: boolean,
        invite?: boolean,
        speed?: boolean,
        profit?: boolean,
        callback?: Function
    }) {
        let qureyInfo = "";
        if (data && data.runway) {
            qureyInfo = "runway=";
        } if (data && data.invite) {
            qureyInfo = "invite=";
        }
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title: WXCtr.shareTitle,
                imageUrl: WXCtr.shareImg,
                query: qureyInfo + UserManager.user_id,
                // success: (res) => {
                //     if (GameCtr.shareSwitch) {
                //         if (GameData.maxPlaneLevel < GameCtr.shareMax) {
                //             if (data.callback) {
                //                 data.callback();
                //             }
                //         }
                //         else if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                //             console.log("shareTickets == ", res.shareTickets);
                //             WXCtr.getWxShareInfo(res.shareTickets[0], data.callback);
                //         } else {
                //             ViewManager.toast("请分享到群！");
                //         }
                //     } else {
                        // if (data.callback) {
                        //     data.callback();
                        // }
                //     }

                // },
                complete: () => {
                    if (data.callback) {
                        data.callback();
                    }
                }
            });
        } else {

        }
    }

    //获取分享转发详细信息
    static getWxShareInfo(shareTicket, callback) {
        if (window.wx != undefined) {
            window.wx.getShareInfo({
                shareTicket: shareTicket,
                success: (resp) => {
                    if (resp.encryptedData && resp.iv) {
                        HttpCtr.shareGroupCheck(resp.encryptedData, resp.iv, callback);
                    }
                },
            });
        }
    }

    static getStorageData(key, defaultValue = 0) {
        if (window.wx != undefined) {
            let value = wx.getStorageSync(key);
            if(!value) value = defaultValue;
            console.log("key == "+key+"  value == ", value);
            return value;
        }
    }

    static setStorageData(key, data) {
        if (window.wx != undefined) {
            wx.setStorage({
                key: key,
                data: data,
                success: (resp) => {

                }
            });
        }
    }


    //导航到其他小程序
    static gotoOther(data) {
        if (data.appid && wx.navigateToMiniProgram) {
            wx.navigateToMiniProgram({
                appId: data.appid,
                path: data.path,
                success(res) {
                    // 打开成功
                },
                fail(err) {
                    wx.showToast({
                        title: '打开失败!',
                        icon: 'none'
                    })
                }
            })
        }
    }

    //打开客服消息
    static customService() {
        if (wx.openCustomerServiceConversation) {
            wx.openCustomerServiceConversation({
                success: () => {
                    WXCtr.exitGame();
                }
            });
        }
    }

    /**
     * 子域消息相关方法
     */

    static initSharedCanvas() {
        if (window.wx != undefined) {
            window.sharedCanvas.width = 880;
            window.sharedCanvas.height = 1200;
        }
    }

    //获取自己信息
    static getSelfData() {
        if (window.wx != undefined) {
            // 发消息给子域
            window.wx.postMessage({
                messageType: Message_Type.Get_SelfData,
            });
        }
    }

    //获取群数据
    static getGroupRankingData() {
        console.log("获取群数据！！！！！！");
        if (window.wx != undefined) {
            window.wx.shareAppMessage({
                title: WXCtr.shareTitle,
                imageUrl: WXCtr.shareImg,
                success: (res) => {
                    console.log("分享成功回调返回值", res);
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: Message_Type.Get_GroupData,
                            SCORE_KEY: "Rank_SCORE",
                            LOCATION_KEY: "LOACTION",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        }
    }

    //获取好友排行榜数据
    static getFriendRankingData() {
        if (window.wx != undefined) {
            // 发消息给子域
            window.wx.postMessage({
                messageType: Message_Type.Get_FriendData,
                SCORE_KEY: "Rank_SCORE",
                LOCATION_KEY: "LOACTION",
            });
        }
    }

    //显示完整好友排行
    static showFriendRanking(page = 1) {
        if (window.wx != undefined) {
            console.log("主域发送消息____显示好友排行");
            window.wx.postMessage({
                messageType: Message_Type.Show_WholeRanking,
                page: page
            });
        }
    }

    //关闭好友排行
    static closeFriendRanking() {
        if (window.wx != undefined) {
            console.log("主域发送消息____关闭好友排行");
            window.wx.postMessage({
                messageType: Message_Type.Close_WholeRanking,
            });
        }
    }

    //提交分数到微信
    static submitScoreToWx(score, location) {
        if (window.wx != undefined) {
            console.log("主域发送消息____提交分数");
            window.wx.postMessage({
                messageType: Message_Type.Submit_SelfScore,
                SCORE_KEY: "Rank_SCORE",
                score: score,
                LOCATION_KEY: "LOACTION",
                location: location
            });
        }
    }
}
