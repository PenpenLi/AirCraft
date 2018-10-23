/**
 * 游戏URL配置
 * 根据自己的项目配置正确的地址
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class UrlConfig {
  static rootUrl = "https://bazi.2-00.cn/feijiplus";                           //接口域名地址根目录
  static LOGIN = "/publicapi.php?method=getuid";                                    //登录
  static SAVE_INFO = "/publicapi.php?method=setUserData";                           //存储微信信息
  static GET_USERINFO = "/publicapi.php?method=getUserInfo";                        //获得用户信息
  static GET_WORLDLIST = "/weixinapi.php?method=getRankList";                      //获得世界排行
  static SET_DATA = "/weixinapi.php?method=setData";                                //提交用户信息
  static SEND_SCROE = "/weixinapi.php?method=settlement";                           //提交用户的分数
  static SHARE_SWITCH = "/weixinapi.php?method=shareSwitch";                        //分享开关
  static GET_SHARE = "/weixinapi.php?method=getShare";                              //分享数据
  static GET_ADSCONFIG = "/weixinapi.php?method=getAllSlides";                      //slide数据
  static OFFLINE_PROFIT = "/weixinapi.php?method=getprofit";                        //离线收益
  static CHANEL_RECORD = "/weixinapi.php?method=addChannelRecord";                  //渠道统计
  static INVITE_FRIEND = "/weixinapi.php?method=addSeek";                           //邀请好友得钻石
  static GET_INVITE_INFO = "/weixinapi.php?method=SeekLog";                         //查询邀请好友信息
  static HELP_SPEED_UP = "/weixinapi.php?method=addSeek2";                          //帮助朋友加速
  static GET_SPEED_UP_INFO = "/weixinapi.php?method=Seek2Log";                      //查询加速信息
  static DELETE_SPEED_UP_INFO = "/weixinapi.php?method=Seek2Delete";                //删除加速信息
  static GET_SETTING = "/weixinapi.php?method=getsetting";                          //审核开关
  static SHARE_GROUP = "/weixinapi.php?method=shareGroup";                          //分享到群
  static GET_GOLD = "/Game/getGoldByShare";                         //分享/看视频获得金币
  static ADConfig = "/weixinapi.php?method=getAdv";                                 //广告配置
  static VideoOpen = "/weixinapi.php?method=openAdv";                               //关闭视频广告时渠道统计
  static Diamond_NOTICE = "/weixinapi.php?method=moenynotice";                      //钻石增加通知
  static CLICK_STATISTICS = "/weixinapi.php?method=openClick";                      //点击统计
  static GET_LOGINAWARD = "/weixinapi.php?method=getToday";                         //获取签到奖励列表
  static SIGN_IN = "/weixinapi.php?method=DoToday";                                 //领取登录奖励
}
