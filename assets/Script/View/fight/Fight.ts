import GameCtr from "../../Controller/GameCtr";


const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _gameBg1=null;
    _gameBg2=null;
    _airs=[];

    @property(cc.Prefab)
    air:cc.Prefab=null;

    onLoad(){
        this.initNode();
        this.startBgRoll();
    }

    initNode(){
        this._gameBg1=this.node.getChildByName("bg1");
        this._gameBg2=this.node.getChildByName("bg2");
    }

    startBgRoll(){
        this._gameBg1.stopAllActions();
        this._gameBg2.stopAllActions();
        this._gameBg1.y=GameCtr.IPONEX_HEIGHT;
        this._gameBg2.y=0;

        this._gameBg1.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(2.5,cc.p(0,-GameCtr.IPONEX_HEIGHT)),
            cc.callFunc(function(){
                if(this._gameBg1.y<=-GameCtr.IPONEX_HEIGHT+5){this._gameBg1.y=GameCtr.IPONEX_HEIGHT};
            }.bind(this)),
        )));
        this._gameBg2.runAction(cc.repeatForever(cc.sequence(
            cc.moveBy(2.5,cc.p(0,-GameCtr.IPONEX_HEIGHT)),
            cc.callFunc(function(){
                if(this._gameBg2.y<=-GameCtr.IPONEX_HEIGHT+5){this._gameBg2.y=GameCtr.IPONEX_HEIGHT};
            }.bind(this)),
        )));
    }


    initAirs(){
        for(let i =0;i<3;i++){
            
        }
    }

    
}
