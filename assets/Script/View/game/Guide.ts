import WXCtr from "../../Controller/WXCtr";
import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import HttpCtr from "../../Controller/HttpCtr";

/**
 * 新手引导
 */

const {ccclass, property} = cc._decorator;

let handleName = ["stepOne", "stepOne", "stepThree", "stepFour", "stepFive", "stepSix", "stepThree", "stepFour"];

@ccclass
export default class Guide extends cc.Component {

    @property(cc.Node)
    ndGuide: cc.Node = null;
    @property(cc.Node)
    ndMask: cc.Node = null;
    @property(cc.Node)
    ndHand1: cc.Node = null;
    @property(cc.Node)
    ndHand2: cc.Node = null;
    @property(cc.Sprite)
    sprGuide: cc.Sprite = null;
    @property(cc.Node)
    ndForece: cc.Node = null;
    @property(cc.Label)
    lbtip: cc.Label = null;

    public mask: cc.Mask;

    public static ins: Guide;

    public static guideStep = 8;



    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Guide.ins = this;
        this.mask = this.ndMask.getComponent(cc.Mask);
    }

    close() {
        this.ndGuide.active = false;
    }

    static show() {
        Guide.ins.ndGuide.active = true;
        Guide.ins.ndForece.active = false;
        Guide.ins.sprGuide.node.active = true;
    }

    setGuideStep(data) {
        if(!data){
            Guide.guideStep = 0;   
        }else{
            if(data) Guide.guideStep = data;
        }
    }

    static setGuideStorage(step) {
        Guide.guideStep = step;   
        HttpCtr.submitUserData({data_1: step});
        GameData.setUserData({guideStep: step});
        if(step <= 7){
            Guide.ins.hideHand();
            Guide.showGuideStep(step);
            Guide.ins.ndGuide.active = true;
        }else{
            Guide.ins.ndGuide.active = false;
        }
    }

    private static showGuideStep(step) {
        Guide.ins[handleName[step]]();
    }

    hideHand() {
        this.ndHand1.position = cc.v2(5000,0);
        this.ndHand1.stopAllActions();
        this.ndHand1.getComponent(cc.Animation).play();
        this.ndHand2.position = cc.v2(5000,0);
        this.ndHand2.stopAllActions();
        this.ndHand2.getComponent(cc.Animation).play();
    }


    stepOne() {
        this.ndMask.position = cc.v2(-80,-480);
        this.mask.type = cc.Mask.Type.ELLIPSE;
        this.ndMask.runAction(cc.sequence(
            cc.scaleTo(0, 3.0),
            cc.scaleTo(0.5, 1.0)
        ));
        this.ndHand1.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0,cc.v2(-80, -520))
        ))
        this.lbtip.string = "点击购买飞机开始起航。";
        this.lbtip.node.position = cc.v2(-80, -180);
    }

    stepThree() {
        this.ndMask.setContentSize(500,500);
        this.ndMask.position = cc.v2(0,0);
        this.mask.type = cc.Mask.Type.ELLIPSE;
        this.ndMask.runAction(cc.sequence(
            cc.scaleTo(0, 3.0),
            cc.scaleTo(0.5, 1.0)
        ))
        this.ndHand2.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0,cc.v2(150, 0)),
            cc.repeat(cc.sequence(
                cc.delayTime(0.2),
                cc.moveBy(1.0, cc.v2(-260, 0)),
                cc.moveBy(0, cc.v2(260, 0))
            ), 100),
        ))
        this.lbtip.string = "拖动飞机，合成更高等级飞机超炫哦。";
        this.lbtip.node.position = cc.v2(0, 300);
    }

    stepFour() {
        this.ndMask.setContentSize(500,500);
        this.ndMask.position = cc.v2(-245,0);
        this.mask.type = cc.Mask.Type.ELLIPSE;
        this.ndMask.runAction(cc.sequence(
            cc.scaleTo(0, 3.0),
            cc.scaleTo(0.5, 1.0)
        ));
        this.ndHand2.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0,cc.v2(-110, -0)),
            cc.repeat(cc.sequence(
                cc.delayTime(0.2),
                cc.moveTo(1.0, cc.v2(-400, -75)),
                cc.moveTo(0, cc.v2(-110, -0))
            ), 100),
        ))
        this.lbtip.string = "把飞机放到跑道上进行赚钱吧。";
        this.lbtip.node.position = cc.v2(-245, 300);
    }

    stepFive() {
        this.ndMask.setContentSize(200,200);
        this.ndMask.position = cc.v2(-130,100);
        this.mask.type = cc.Mask.Type.ELLIPSE;
        this.ndMask.runAction(cc.sequence(
            cc.scaleTo(0, 3.0),
            cc.scaleTo(0.5, 1.0)
        ))
        this.ndHand1.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0,cc.v2(-130,20))
        ))
        this.lbtip.string = "再次点击正在赚钱的飞机即可召回。";
        this.lbtip.node.position = cc.v2(-130, 400);

    }

    stepSix() {
        this.ndMask.setContentSize(200,200);
        this.ndMask.position = cc.v2(130,100);
        this.mask.type = cc.Mask.Type.ELLIPSE;
        this.ndMask.runAction(cc.sequence(
            cc.scaleTo(0, 3.0),
            cc.scaleTo(0.5, 1.0)
        ))
        this.ndHand1.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.moveTo(0,cc.v2(130,20))
        ))

        // GameCtr.ins.mGame.addLandPlane(2, "freeGift");
        this.lbtip.string = "点开宝箱获得额外飞机。";
        this.lbtip.node.position = cc.v2(130, 400);
    }

    // update (dt) {}
}
