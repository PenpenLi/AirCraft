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
    }
    
    onDestroy() {
    }

    start() {
    }

    reigsterTouch() {
        this.ndScr.on(cc.Node.EventType.TOUCH_MOVE, this.onScrTouchMoved, this);
    }

    onScrTouchMoved(event) {
        if (this.ndContent.y > this.contentOrigin + (this.itemPages * this.pageSize - 3) * this.cellHeight) {
            if (this.itemPages < 6) {
                this.itemPages++;
                // this.addItems();
            }
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
