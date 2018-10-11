import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";
import SpeedTotal from "../game/SpeedTotal";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpeedUp extends cc.Component {

    @property(cc.Label)
    lbCountDown: cc.Label = null;
    @property(cc.Node)
    ndContent: cc.Node = null;

    private time = 0;
    private idx = -1;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    }

    onDestroy() {
        this.unscheduleAllCallbacks();
        GameCtr.ins.mGame.countDown();
    }

    start () {
        this.time = SpeedTotal.speedUpTime;
        this.countDown();
        this.schedule(()=>{this.countDown();}, 1);
    }
    
    share() {
        GameCtr.clickStatistics(GameCtr.StatisticType.SPEED);                               //加速分享统计
        WXCtr.share({
            speed: true,
            callback: ()=>{
                this.addTime();
            }
        });
    }

    addTime() {
        this.time += 120;
        if(this.time > 1440){
            this.time = 1440;
        }
        if(SpeedTotal.speedUpTime == 0){
            SpeedTotal.speedUp();
        }
        SpeedTotal.speedUpTime += 120;
        if(SpeedTotal.speedUpTime > 1440){
            SpeedTotal.speedUpTime = 1440;
        }
    }

    countDown() {
        if(this.time <=0) {
            return;
        }
        this.time--;
        this.showLbCountDown();
        let idx = Math.ceil(this.time / 120);
        if(idx > 11) idx = 11;
        if(idx != this.idx) {
            this.idx = idx;
            this.showContentChildren(idx);
        }
    }

    showContentChildren(idx) {
        for(let i=0; i<this.ndContent.childrenCount; i++) {
            if(i<idx){
                this.ndContent.children[i].active = true;
            }else{
                this.ndContent.children[i].active = false;
            }
        }
    }

    showLbCountDown() {
        let min: any = Math.floor(this.time / 60);
        let sec: any = this.time % 60;
        if(min < 10) {
            min = "0"+min;
        }
        if(sec < 10) {
            sec = "0"+sec;
        }
        this.lbCountDown.string = min+":"+sec;
    }

    // update (dt) {}
}
