import GameCtr from "../../Controller/GameCtr";
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _gameBg1=null;
    _gameBg2=null;
    _airs=[];
    _bullets=[];
    @property(cc.Prefab)
    airsPrefab:cc.Prefab[]=[];
    

    onLoad(){
        GameCtr.getInstance().setFight(this);
        this.openCollider()
        this.initNode();
        this.startBgRoll();
        this.initEnemys();
        this.initAirs();
    }

    //开启碰撞检测系统
    openCollider(){
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
        manager.enabledDrawBoundingBox = true;
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
        for(let i=0;i<1;i++){
            let air = cc.instantiate(this.airsPrefab[0]);
            air.parent=cc.find("Canvas");
            this._airs.push(air);
            //air.x=-200+i*200;
            air.y=-300;
            air.getComponent("Air").startAttack();
        }
    }


    initEnemys(){
        for(let i=0; i<1; i++){
            let enemy = cc.instantiate(this.airsPrefab[0]);
            enemy.parent=cc.find("Canvas");
            enemy.scaleY=-1;
            //enemy.x=-200+i*200;
            enemy.y=800;
            let rect=enemy.getBoundingBox();
            this._airs.push(enemy);
        }
    }

    addBullet(bullet){
        this._bullets.push(bullet);
        console.log("log-----------this._bullets=:",this._bullets);
    }

    removeBullet(bullet){
        for(let i =0;i<this._bullets.length;i++){
            if(bullet.tag==this._bullets[i].tag){
                this._bullets.splice(i,1)
            }
        }
    }

    getBulletsLength(){
        return this._bullets.length;
    }


    update(dt){
        for(let i=0;i<this._airs.length;i++){
            for(let j=0;j<this._bullets.length;j++){
                if(cc.rectContainsPoint(this._airs[i].getBoundingBox(),cc.p(this._bullets[j].x,this._bullets[j].y))){
                    console.log('log-----------击中飞机-----------');
                    this._bullets[j].active=false;
                    this.removeBullet(this._bullets[j]);
                    this._airs[i].getComponent("Air").onAttacked(this._bullets[j].getComponent("Bullet").hurt);
                }
            }
        }

    }

    
}
