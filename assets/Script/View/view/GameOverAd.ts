import Util from "../../Common/Util";
import WXCtr from "../../Controller/WXCtr";
import HttpCtr from "../../Controller/HttpCtr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteFrame)
    nameFrames:cc.SpriteFrame[]=[];

    @property(cc.Label)
    lb_name:cc.Label=null;

    @property(cc.Label)
    lb_des:cc.Label=null;

    @property(cc.Sprite)
    sp:cc.Sprite=null;

    @property(cc.Sprite)
    nameFrame:cc.Sprite=null;

    setName(name){
        this.lb_name.string=name;
    }

    setDes(des){
        this.lb_des.string=des;
    }

    setNameFrame(index){
        this.nameFrame.spriteFrame=this.nameFrames[index];
    }



    init(data,index){
        this.setName(data.name);
        this.setDes(data.numbers+"人在玩");
        this.setNameFrame(index)
        Util.loadImg(this.sp,data.imageurl)
        let obj = {appid:data.id,path:data.path}
        this.sp.node.on(cc.Node.EventType.TOUCH_START, ()=>{
            WXCtr.gotoOther(obj);
            HttpCtr.reportClickInfo(data.affair,data.id);
        });
        
    }










  
}
