import GameCtr from "../../Controller/GameCtr";

const {ccclass, property} = cc._decorator;
enum Way{
    BUY=0,
    WATCH_VEDIO=1
}

@ccclass
export default class NewClass extends cc.Component {
    _btn_close=null;
    _btn_buy=null;
    _btn_watchVedio=null;
    _tableNode=null;
    _table=null;
    _lightsNode=null;
    _lb_rate=null;
    _lb_timeCount=null;
    _lightsArr=[];
    _index=0;
    _lottery=false;
    _lotteryTime=0;
    _way=-1;

    onLoad(){
        this.initNode();
        this.initLights();
    }

    initNode(){
        this._tableNode=this.node.getChildByName("tableNode");
        this._lightsNode=this._tableNode.getChildByName("lightsNode");
        this._table=this._tableNode.getChildByName('table');

        this._lb_rate=this.node.getChildByName("lb_rate");
        this._lb_timeCount=this.node.getChildByName("lb_timeCount");

        this._btn_close=this.node.getChildByName("btn_close");
        this._btn_buy=this.node.getChildByName("btn_buy");
        this._btn_watchVedio=this.node.getChildByName("btn_watchVedio");

        this._lb_rate.active=false;
        this._lb_timeCount.active=false;

        this.initBtnEvent(this._btn_close);
        this.initBtnEvent(this._btn_buy);
        this.initBtnEvent(this._btn_watchVedio);
    }


    initBtnEvent(btn){
        btn.on(cc.Node.EventType.TOUCH_END,(e)=>{
            if(e.target.getName()=="btn_close"){
                this.node.destroy();
            }else if(e.target.getName()=="btn_buy"){
                this._way=Way.BUY;
                this.doLottery();
            }else if(e.target.getName()=="btn_watchVedio"){
                this._way=Way.WATCH_VEDIO;
                this.doLottery();
            }
        })
    }

    initLights(){
        for(let i=1;i<=this._lightsNode.children.length;i++){
            let light=this._lightsNode.getChildByName("light"+i);
            this._lightsArr.push(light);
            light.rotation=20*(i-1);
        }
        this.doTwinkle();
    }


    doTwinkle(){
        for(let i=0;i<this._lightsArr.length;i++){
            let light1=this._lightsArr[i].getChildByName("1");
            let light2=this._lightsArr[i].getChildByName("2");
            if(this._index%2==0){
                light1.active=true;
                light2.active=false;
            }else {
                light1.active=false;
                light2.active=true;
            }
        }
        this._index++;
        this.scheduleOnce(()=>{
            this.doTwinkle();
        },0.5)
    }


    doLottery(){
        let randAngle=720+Math.floor(Math.random()*360);
        this._lottery=true;
        this._lotteryTime=Math.random()+4;
    }

    doLotteryOver(){
        let rotation=this._table.rotation%360;
        if(rotation>=0 && rotation<22.5){
            GameCtr.attactGoldRate=2;
        }else if(rotation>=22.5 && rotation<22.5+45){
            GameCtr.attactGoldRate=4;
        }else if(rotation>=22.5+45 && rotation<22.5+2*45){
            GameCtr.attactGoldRate=2
        }else if(rotation>=22.5+45*2 && rotation<22.5+3*45){
            GameCtr.attactGoldRate=3
        }else if(rotation>=22.5+45*3 && rotation<22.5+4*45){
            GameCtr.attactGoldRate=2
        }else if(rotation>=22.5+45*4 && rotation<22.5+5*45){
            GameCtr.attactGoldRate=4
        }else if(rotation>=22.5+45*5 && rotation<22.5+6*45){
            GameCtr.attactGoldRate=2
        }else if(rotation>=22.5+45*6 && rotation<22.5+7*45){
            GameCtr.attactGoldRate=3
        }else if(rotation>=22.5+7*45 && rotation<8*45){
            GameCtr.attactGoldRate=2
        }

        if(this._way==Way.BUY){
            GameCtr.attactGoldRateTime=3600;//1小时
        }else if(this._way==Way.WATCH_VEDIO){
            GameCtr.attactGoldRateTime=7200;//2小时
        }

        this.showDes()
    }

    showDes(){
        this._lb_rate.active=true;
        this._lb_timeCount.active=true;

        this._lb_rate.getComponent(cc.Label).string="战斗中金币获得总加倍："+GameCtr.attactGoldRate+"倍！！！"
        //this._lb_timeCount.getComponent(cc.Label).string="剩余时间:"+ 01:48:57
    }

    update(dt){
        if(this._lottery){
            this._lotteryTime-=dt;
            if(this._lotteryTime<=0){
                this._lotteryTime=0;
                this._lottery=false;
                this.doLotteryOver();
            }
            this._table.rotation+=this._lotteryTime*3; 
        }
    }
}
