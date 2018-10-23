import WXCtr from "../../Controller/WXCtr";
import HttpCtr from "../../Controller/HttpCtr";
import GameData from "../../Common/GameData";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    _btn_close=null;
    _btn_invite=null;
    _btn_getBonus=null;
    _lb_inviteCount=null;
    _lb_getBonusCount=null;
    _tip=null;
    _inviteRelust=null;


    onLoad(){
        this.initNode();
        this.requestInviteResult();
    }

    

    initNode(){
        this._btn_close=this.node.getChildByName("btn_close");
        this._btn_invite=this.node.getChildByName("btn_invite");
        this._btn_getBonus=this.node.getChildByName("btn_getBonus");
        this._lb_inviteCount=this.node.getChildByName("lb_inviteCount");
        this._lb_getBonusCount=this.node.getChildByName("lb_getBonusCount");
        this._tip=this.node.getChildByName("tipNode").getChildByName("tip02");

        this._lb_getBonusCount.active=false;
        this._tip.active=false;

        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_invite);
        this.initBtnEvent(this._btn_getBonus);
    }

    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_close"){
                this.node.destroy()
            }else if(e.target.getName()=="btn_invite"){
                WXCtr.share({invite: true});
            }else if(e.target.getName()=="btn_getBonus"){
                if(this._inviteRelust){
                    if(this._inviteRelust.length-GameData.freeDiamondCount){
                        this.getBonus();
                    }
                }
            }
        })
    }

    getBonus(){
        GameData.gold+=300;
        GameData.freeDiamondCount+=1;
    }

    requestInviteResult(){
        HttpCtr.getInviteResult((res) => {
            this._inviteRelust=res;
            this._lb_inviteCount.getComponent(cc.Label).string="您已邀请"+res.length+"人";
            if(res.length - GameData.freeDiamondCount<=0){
                this._tip.active=true;
            }else {
                this._lb_getBonusCount.active=true;
                this._lb_getBonusCount.getComponent(cc.Label).string=res.length-GameData.freeDiamondCount;
            }
        });

        this.scheduleOnce(()=>{this.requestInviteResult()},2)
    }
}
