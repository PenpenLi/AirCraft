import Ranking from "./Ranking";
import RankingCell from "./RankingCell";


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

@ccclass
export default class CanvasCtr extends cc.Component {

    @property(Ranking)
    mRanking: Ranking = null;

    // LIFE-CYCLE CALLBACKS:
    private mCanvas: cc.Canvas;
    private mFriendRankData;
    private mGroupData;
    private mSelfData = null;
    private mSelfRank = null;

    onLoad() {
        this.handleWxMessage();
    }

    handleWxMessage() {
        if (window.wx != undefined) {
            window.wx.onMessage(data => {
                console.log("收到主域消息");
                if (data.messageType == Message_Type.Get_FriendData) {              //获取好友排行榜数据
                    this.getFriendData(data.SCORE_KEY, data.LOCATION_KEY);
                } else if (data.messageType == Message_Type.Get_GroupData) {        //获取群排名
                    this.getGroupData(data.SCORE_KEY, data.shareTicket)
                } else if (data.messageType == Message_Type.Submit_SelfScore) {     //提交得分
                    this.submitScore(data.score, data.SCORE_KEY, data.location, data.LOCATION_KEY);
                } else if (data.messageType == Message_Type.Show_WholeRanking) {     //显示完整排行榜
                    this.showFriendRanking(data.page);
                } else if (data.messageType == Message_Type.Get_SelfData) {          //获取自己信息
                    this.getSelfData();
                } else if (data.messageType == Message_Type.Close_WholeRanking) {    //关闭完整排行
                    this.closeFriendRanking();
                }
            });
        } else {

        }
    }

    onDestroy() {

    }

    getSelfData() {
        console.log("获取自己信息！！！！！！！！！！！！！");
        if (window.wx != undefined) {
            window.wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    console.log("获取自己信息成功！！！！！！！！！！！！！", userRes);
                    let userData = userRes.data[0];
                    this.mSelfData = userData;
                },
                fail: (res) => {
                    console.log("获取自己信息失败！！！！！！！！！！！！！");
                }
            });
        }
    }

    getFriendData(SCORE_KEY, LOCATION_KEY, showFriend = false) {
        console.log("获取好友排行榜数据！！！！！！！！！！！！！");
        if (window.wx != undefined) {
            window.wx.getFriendCloudStorage({
                keyList: [SCORE_KEY, LOCATION_KEY],
                success: (res) => {
                    console.log("获取好友排行榜数据成功", res);
                    let data = res.data;
                    data.sort((a, b) => {
                        if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                            return 0;
                        }
                        if (a.KVDataList.length == 0) {
                            return 1;
                        }
                        if (b.KVDataList.length == 0) {
                            return -1;
                        }
                        return b.KVDataList[1].value - a.KVDataList[1].value;
                    });
                    this.mFriendRankData = data;
                    if (showFriend) {
                        this.showFriendRanking();
                    }
                },
                fail: res => {
                    console.log("获取好友排行榜数据失败");
                },
            });
        }
    }

    getGroupData(SCORE_KEY, shareTicket) {
        if (window.wx != undefined) {
            window.wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    window.wx.getGroupCloudStorage({
                        shareTicket: shareTicket,
                        keyList: [SCORE_KEY],
                        success: (res) => {
                            console.log("wx.getGroupCloudStorage success", res);
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[1].value - a.KVDataList[1].value;
                            });
                            this.mGroupData = data;
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                        },
                    });
                }
            });
        }
    }

    submitScore(score, SCORE_KEY, location, LOCATION_KEY) {
        console.log('提交分数')
        if (window.wx != undefined) {
            window.wx.getUserCloudStorage({
                // 以key/value形式存储
                keyList: [SCORE_KEY, LOCATION_KEY],
                success: (getres) => {
                    console.log('提交分数成功', getres)
                    if (getres.KVDataList.length != 0) {
                        if (getres.KVDataList[0].value > score) {
                            return;
                        }
                    }
                    // 对用户托管数据进行写数据操作
                    window.wx.setUserCloudStorage({
                        KVDataList: [
                            {
                                key: SCORE_KEY,
                                value: "" + score
                            },
                            {
                                key: LOCATION_KEY,
                                value: location
                            }
                        ],
                        success: (res) => {
                            console.log('setUserCloudStorage', 'success', res)
                        },
                    });
                },
                fail: function (res) {
                    console.log('提交分数失败', 'fail')
                },
                complete: (res) => {
                    console.log('提交分数完成', 'ok')
                }
            });
        } else {
            cc.log("提交得分:" + SCORE_KEY + " : " + score)
        }
    }

    closeFriendRanking() {
        this.mRanking.clear();
    }

    showFriendRanking(page = 1) {
        console.log("显示好友排行榜", this.mFriendRankData);
        if (!this.mFriendRankData) {
            console.log("没有好友排行榜信息，请先获取好友排行榜信息");
            this.getFriendData("Rank_SCORE", "LOACTION", true);
            return;
        }
        this.closeFriendRanking();
        console.log("page == ", page);
        this.getSelfRank();
        this.mRanking.loadRanking(this.mFriendRankData);
    }

    getSelfRank() {
        let rank = 0;
        if (this.mSelfData) {
            for (let i = 0; i < this.mFriendRankData.length; i++) {
                let data = this.mFriendRankData[i];
                if (data.avatarUrl == this.mSelfData.avatarUrl) {
                    rank = i;
                    this.mSelfData = data;
                    this.mRanking.showSelf(data, i);
                }
            }
        }
        return rank;
    }

    // start () {

    // }

    // update (dt) {}
}
