import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import Util from "../../Common/Util";
import ViewManager from "../../Common/ViewManager";


const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _btn_close=null;
    _btn_open=null;
    _btn_buy=null;
    _btn_watchVedio=null;
    _bonusNode=null;
    _lb_surplusTimes=null;
    _lb_timeCount=null;
    _lottery=null;
    _bonusArr=[];
    _bonusData=[];
    _bonusTimesArr=[];
    _timeCount=0;

    _hour=-1;
    _min=-1;
    _sec=-1;

    onLoad(){
        this.initLotteryTimes();
        this.initData();
        this.initNode();
        this.initBonus();
        this.caculateTimeCount();
    }

    initLotteryTimes(){
        let lottery=localStorage.getItem("lottery")
        if(!lottery){
            GameData.lotteryTimes=10;
        }else{
            let lotteryObj=JSON.parse(lottery);
            if(lotteryObj.day==Util.getCurrTimeYYMMDD()){
                GameData.lotteryTimes=lotteryObj.times;
            }else{
                GameData.lotteryTimes=lotteryObj.times+5;
                GameData.lotteryTimes=GameData.lotteryTimes>10?10:GameData.lotteryTimes;
            }
        }
    }


    initData(){
        this._bonusData=[
            {airLevel:0,diamond:100},
            {airLevel:5,diamond:0},
            {airLevel:0,diamond:60},
            {airLevel:8,diamond:0},
            {airLevel:0,diamond:50},
            {airLevel:10,diamond:0},
            {airLevel:0,diamond:40},
            {airLevel:6,diamond:0},
            {airLevel:0,diamond:20},
            {airLevel:7,diamond:0},
        ]
    }

    initNode(){
        this._bonusNode=this.node.getChildByName("bonusNode");
        this._btn_close=this.node.getChildByName('btn_close');
        this._btn_open=this.node.getChildByName('btn_open');
        this._btn_buy=this.node.getChildByName('btn_buy');
        this._btn_watchVedio=this.node.getChildByName('btn_watchVedio');

        this._lb_surplusTimes=this.node.getChildByName("lb_surplusTimes");
        this._lb_timeCount=this.node.getChildByName("lb_timeCount");
        this._lottery=this.node.getChildByName("lottery");

        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_open);
        this.initBtnEvent(this._btn_buy);
        this.initBtnEvent(this._btn_watchVedio);

        this.setLotteryTimes();
    }

    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_close"){
                this.node.destroy();
            }else if(e.target.getName()=="btn_open"){
                this.doLottery()
            }else if(e.target.getName()=="btn_buy"){
                this.buyLotteryTimes();
            }else if(e.target.getName()=="btn_watchVedio"){
                /*看视频 送两次奖励*/
                let callFunc=()=>{
                    GameData.lotteryTimes+=2;
                    this.setLotteryTimes();
                }
            }
        })
    }

    initBonus(){
        for(let i=0;i<10;i++){
            let bonus=this._bonusNode.getChildByName("bonus"+i);
            let bonusName=bonus.getChildByName("lbName");
            this._bonusArr.push(bonus);
        }
    }

    setLotteryTimes(){
        this._lb_surplusTimes.getComponent(cc.Label).string=GameData.lotteryTimes;
    }


    doLottery(){
        if(GameData.lotteryTimes<=0){
            /* 无抽奖次数 */
            return;
        }
        GameData.lotteryTimes--;
        this.setLotteryTimes();
        this._lottery.active=true;
        let random=Math.floor(Math.random()*10)+20;
        let currentIndex=this.getLotteryIndex();
        let index=0;
        for(let i=0;i<random;i++){
            let delayTime=0;
            if(random-i==3){
                delayTime=0.3
            }else if(random-i==2){
                delayTime=0.7
            }else if(random-i==1){
                delayTime=1.2
            }
            this.node.runAction(cc.sequence(
                cc.delayTime(0.1*i+delayTime),
                cc.callFunc(()=>{
                    index++;
                    currentIndex++;
                    currentIndex=currentIndex>=10?0:currentIndex;
                    this._lottery.x=this._bonusArr[currentIndex].x;
                    this._lottery.y=this._bonusArr[currentIndex].y;
                    if(index==random){
                        this.getBonus(currentIndex)
                        GameData.setMissonData("boxTimes", GameData.missionData.boxTimes+1);
                    }
                })
            ))
        }
    }


    getLotteryIndex(){
        for(let i=0;i<this._bonusArr.length;i++){
            if(this._lottery.x==this._bonusArr[i].x && this._lottery.y==this._bonusArr[i].y){
                return i;
            }
        }
        return null;
    }

    buyLotteryTimes(){
        if(GameData.diamonds>=50){
            GameData.lotteryTimes++;
            this.setLotteryTimes();
            GameData.diamonds-=50
        }else{
            ViewManager.toast("钻石不足");
        }
    }

    getBonus(index){
        let bonus=this._bonusData[index];
        if(bonus.airLevel>0){
            for(let i=0;i<GameCtr.selfPlanes.length;i++){
                if(GameCtr.selfPlanes[i]==0){
                    GameCtr.selfPlanes[i]=bonus.airLevel;
                    ViewManager.toast("获得"+bonus.airLevel+"级飞机");
                    return;
                }
            }
            ViewManager.toast("没有空的机位");
        }

        if(bonus.diamond>0){
            GameData.diamonds+=bonus.diamond;
            ViewManager.toast("获得"+bonus.diamond+"钻石"); 
        }
    }

    caculateTimeCount(){
        this._bonusTimesArr=[4,8,12,16,20,24];
        let date=new Date();
        let hour=date.getHours();
        let min=date.getMinutes();
        let sec=date.getSeconds();
       
        for(let i=0;i<this._bonusTimesArr.length;i++){
            if(this._bonusTimesArr[i]-hour>0){
                this._timeCount= (this._bonusTimesArr[i]-1-hour)*3600+ (59-min)*60 +(60-sec);
                this.timeCount()
                return;
            }
        }
    }

    timeCount(){
        if(this._timeCount==0){
            GameData.lotteryTimes++;
            this._timeCount=14400;
        }
        this._hour=Math.floor(this._timeCount/3600);
        this._min=Math.floor(this._timeCount%3600/60);
        this._sec=Math.floor(this._timeCount%60);

        let str_hour=this._hour<10?"0"+this._hour:this._hour+"";
        let str_min=this._min<10?"0"+this._min:this._min+"";
        let str_sec=this._sec<10?"0"+this._sec:this._sec+"";

        this._lb_timeCount.getComponent(cc.Label).string=str_hour+":"+str_min+":"+str_sec;
        this._timeCount--;
        this.scheduleOnce(()=>{
            this.timeCount()
        },1);
    }



}
