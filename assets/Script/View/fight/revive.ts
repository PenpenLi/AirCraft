import GameCtr from "../../Controller/GameCtr";
import Util from "../../Common/Util";
import AudioManager from "../../Common/AudioManager";
import GameData from "../../Common/GameData";
import HttpCtr from "../../Controller/HttpCtr";
import WXCtr from "../../Controller/WXCtr";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {

    _btn_revive=null;
    _btn_return=null;
    _lb_gold=null;
    _countTime=10;
    _ad=[];

    @property(cc.Node)
    ndLights:cc.Node=null;

    @property(cc.Node)
    adContent:cc.Node=null;

    @property(cc.Node)
    adNode:cc.Node=null;

    @property(cc.Prefab)
    ad:cc.Prefab=null;

    @property(cc.Prefab)
    gameOver:cc.Prefab=null;

    @property(cc.ProgressBar)
    reviveProgress:cc.ProgressBar=null;

    onLoad(){
        this.initNode();
        GameCtr.doubleAttack=false;
        GameCtr.doubleGold=false; 
        //if(GameCtr.reviewSwitch){
            HttpCtr.getAdsByType(this.showAds.bind(this), "Recommend");
        //}
    }

    initNode(){
        this._btn_revive=this.node.getChildByName("btn_revive");
        this._btn_return=this.node.getChildByName("btn_return");
        this._lb_gold=this.node.getChildByName("lb_gold");
        this.ndLights.runAction(cc.repeatForever(cc.rotateBy(2.0,360)));

        this._lb_gold.getComponent(cc.Label).string=Util.formatNum(GameData.gold-GameCtr.fightStartGold);

        this.initBtnEvent(this._btn_revive);
        this.initBtnEvent(this._btn_return);

        if (!WXCtr.videoAd || GameCtr.surplusVideoTimes <= 0) {
            this._btn_revive.active = false;
            this.reviveProgress.node.active=false;
        }
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            AudioManager.getInstance().playSound("audio/click", false);
            cc.director.resume();
            if(e.target.getName()=="btn_revive"){
                // let callFunc=()=>{
                //     GameCtr.getInstance().getFight().initAirs();
                //     GameCtr.getInstance().getFight().emenyStartAttack();
                //     this.node.destroy();
                // }
                GameCtr.getInstance().getFight().initAirs();
                GameCtr.getInstance().getFight().emenyStartAttack();
                this.node.destroy();

            }else if(e.target.getName()=="btn_return"){
                GameCtr.getInstance().getFight().stopGame();
                this.node.destroy();
                this.showGameOver();
            }
            
        })
    }

    setGold(_gold){
        this._lb_gold.getComponent(cc.Label).string=Util.formatNum(GameData.gold-GameCtr.fightStartGold);
    }



    showAds(ads){
        console.log("log-------------inGame ads=:",ads);
        this.adNode.active=true;
        let adArr=GameCtr.getAdList(ads.data, 1);
        if(adArr && adArr.length>0){
            for (let i = 0; i < adArr.length; i++) {
                let ad = cc.instantiate(this.ad);
                ad.parent = this.adContent;
                ad.x = -342 + i * 231;
                ad.y = 12;
                ad.getComponent("ad").init(adArr[i]);
                this._ad.push(ad);
            }
            this.scheduleOnce(this.doCarousel.bind(this), 10);
        }
    }

    doCarousel(){
        if (this._ad.length <= 4) { //广告位推荐位大于4个，才有轮播功能
            return
        }
        //整体左移一个广告位
        for (let i = 0; i < this._ad.length - 1; i++) {
            this._ad[i].stopAllActions();
            this._ad[i].scale = 1.0;
            this._ad[i].runAction(cc.moveBy(0.5, cc.p(-231 * 1, 0)))
        }
        //将超出左边边界的移动到右边
        this._ad[this._ad.length - 1].runAction(cc.sequence(
            cc.moveBy(0.5, cc.p(-231 * 1, 0)),
            cc.callFunc(() => {
                let first = this._ad.shift();
                this._ad.push(first);
                this._ad[this._ad.length - 1].x = this._ad[this._ad.length - 2].x + 231;
                this.scheduleOnce(this.doCarousel.bind(this), 10)
            })
        ))
    }



    showGameOver(){
        if(cc.find("Canvas").getChildByName("gameOver")){
            return;
        }
        let gameOver=cc.instantiate(this.gameOver);
        gameOver.parent=cc.find("Canvas");
        gameOver.setLocalZOrder(20);
    }

    update(dt){
        if(this._countTime>=0){
            this._countTime-=dt;
            this.reviveProgress.progress=this._countTime/10;
            if(this._countTime<=0){
                GameCtr.getInstance().getFight().stopGame();
                this.showGameOver();
                this.node.destroy();
            }
        }
    }

    
}
