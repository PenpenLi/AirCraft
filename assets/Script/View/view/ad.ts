import GameCtr from "../../Controller/GameCtr";
import WXCtr from "../../Controller/WXCtr";
import HttpCtr from "../../Controller/HttpCtr";
import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    _adSprite=null;
    _adName=null;

    onLoad(){
       this._adSprite=this.node.getChildByName("sp");
       this._adName=this.node.getChildByName("name");
    }
    
    init(data){
        let sp = this._adSprite.getComponent(cc.Sprite);
        Util.loadImg(sp,data.imageurl)
        let obj = {appid:data.appid,path:data.path}
        this._adSprite.on(cc.Node.EventType.TOUCH_START, ()=>{
            WXCtr.gotoOther(obj);
            HttpCtr.reportClickInfo(data.affair,data.appid);
        });
        this._adName.getComponent(cc.Label).string=data.name;
    }


    doShake(){
        this.node.runAction(cc.repeatForever(cc.sequence(
            cc.rotateBy(0.1,-10),
            cc.rotateBy(0.2,20),
            cc.rotateBy(0.1,-10),
            cc.rotateBy(0.05,-10),
            cc.rotateBy(0.1,20),
            cc.rotateBy(0.05,-10),
            cc.delayTime(2),
        )))
    }


    doScale(){
        this.node.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.3,1.1),
            cc.scaleTo(0.3,1.0),
            cc.scaleTo(0.3,1.1),
            cc.scaleTo(0.3,1.0),
            cc.delayTime(2),
        )))
    }

    stopActions(){
        this.node.stopAllActions();
    }
}
