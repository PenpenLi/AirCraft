import MallItem from "./MallItem";
import GameData from "../../Common/GameData";
import PopupView from "../view/PopupView";
import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

let itemNums = 30;

@ccclass
export default class Mall extends cc.Component {

    @property(cc.Node)
    ndScr: cc.Node = null;
    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Label)
    lbGold: cc.Label = null;
    @property(cc.Prefab)
    pfItem: cc.Prefab = null;

    private itemPages;
    private pageSize = 6;
    private cellHeight = 430;
    private contentOrigin = 570;

    private allItems = [];
    private lastGold = 0;

    onLoad() {
        this.itemPages = 1;
        this.reigsterTouch();
        cc.systemEvent.on("SET_GOLD", this.setGold, this);
    }
    
    onDestroy() {
        cc.systemEvent.off("SET_GOLD", this.setGold, this);
    }

    start() {
        this.addItems();
        this.setGold();
    }

    reigsterTouch() {
        this.ndScr.on(cc.Node.EventType.TOUCH_MOVE, this.onScrTouchMoved, this);
    }

    onScrTouchMoved(event) {
        if (this.ndContent.y > this.contentOrigin + (this.itemPages * this.pageSize - 3) * this.cellHeight) {
            if (this.itemPages < 6) {
                this.itemPages++;
                this.addItems();
            }
        }
    }

    addItems() {
        let maxLevel = GameData.maxPlaneLevel;
        let freeLevel = Math.floor((Math.random() * 10 + 70) / 100 * maxLevel * Math.pow(0.9, maxLevel / 30));
        if(freeLevel > 15){
            if (maxLevel - freeLevel < 4) {
                freeLevel = maxLevel - 4;
            }
        }else{
            if (maxLevel - freeLevel < 3) {
                freeLevel = maxLevel - 3;
            }
        }
        let cTime = new Date().getTime();
        let lTime = GameCtr.lastFreeMallPlaneTime;
        let offTime = Math.floor((cTime - lTime) / 1000);

        for (let i = (this.itemPages - 1) * this.pageSize; i < this.itemPages * this.pageSize; i++) {
            if(i >= GameData.maxPlane) return;
            let item = cc.instantiate(this.pfItem);
            this.ndContent.addChild(item);
            let comp = item.getComponent(MallItem);
            this.allItems.push(comp);
            let level = i + 1;
            let times = GameData.getBuyTimesOfPlane(level);
            comp.setData({level: level, times: times})
            if(freeLevel == level && maxLevel > 6 && offTime > 60) {
                comp.showShareBtn();
            }
        }
    }

    setGold() {
        if(this.lastGold === 0 || this.lastGold > GameData.gold) {
            this.lbGold.string = GameCtr.formatNum(GameData.gold, 9);
            this.lastGold = GameData.gold;
        }else{
            this.lbGold.node.stopAllActions();
            let increment = Math.floor((GameData.gold - this.lastGold) / 20);
            this.lbGold.node.runAction(cc.repeat(cc.sequence(
                cc.callFunc(()=>{
                    this.lastGold += increment;
                    this.lbGold.string = GameCtr.formatNum(this.lastGold, 9);
                }),
                cc.delayTime(0.025),
            ), 20));
        }
    }

    close() {
        if (!this.node.parent) {
            return;
        }
        let popupView = this.node.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
    }

    enableAllItemGoldBtn(isAble) {
        for(let i = 0; i< this.allItems.length; i++){
            let comp: MallItem = this.allItems[i];
            comp.enableGoldBtn(isAble);
        }
        
    }

    // update (dt) {}
}
