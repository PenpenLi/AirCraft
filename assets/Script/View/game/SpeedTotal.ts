import GameCtr from "../../Controller/GameCtr";

//游戏所有加速

const { ccclass, property } = cc._decorator;

@ccclass
export default class SpeedTotal {
    static speedUpTime = 0;
    constructor() {

    }

    static speedUp() {
        let interval = setInterval(() => {
            this.speedUpTime--;
            if(this.speedUpTime > 0){
                GameCtr.ins.mGame.speedUp(0.5);
            }else{
                GameCtr.ins.mGame.speedUp(0);
                clearInterval(interval);
            }
        }, 1000);
    }
}
