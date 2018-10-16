import GameCtr from "../../Controller/GameCtr";
import NodePoolManager from "../../Common/NodePoolManager";


const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _lifeValue=null;
    _currentLifeValue=null;
    _bulletHurt=null;
    _bulletSpeed=3;
    _attackInterval=2;
    _bulletsArr=[];
    _skin=null;
    _lifeBar=null;
    _isEnemy=false;
    _bubbleHurtPool=null;

   
    @property(cc.Prefab)
    bullet:cc.Prefab=null;

    @property(cc.Prefab)
    bubbleHurt:cc.Prefab=null;

    onLoad(){
        this._skin=this.node.getChildByName("skin");
        this._lifeBar=this.node.getChildByName("lifeBar");
        this._lifeBar.active=false;

        this._bubbleHurtPool=new cc.NodePool();
    }

    startAttack(){
        this.schedule(this.doAttacked, this._attackInterval);
    }


    init(data){
        this._lifeValue=data.lifeValue;
        this._bulletHurt=data.bulletHurt;
        this._currentLifeValue=data.lifeValue;
        this._isEnemy=data.isEnemy;
        this.initBullets();
        this.initBubbleHurt();
        if(this._isEnemy){
            this._skin.scaleY=-1;
            this._lifeBar.active=true;
            this._lifeBar.getComponent(cc.ProgressBar).progress=1;
        }
    }

    

    initBullets(){
        for(let i=0;i<3;i++){
            let bullet =cc.instantiate(this.bullet);
            bullet.parent=cc.find("Canvas");
            bullet.active=false;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150;

            bullet.getComponent("Bullet").init({hurt:this._bulletHurt,isEnemy:this._isEnemy})
            this._bulletsArr.push(bullet);
        }
    }

    initBubbleHurt(){
        for(let i=0;i<3;i++){
            let bubbleHurt=cc.instantiate(this.bubbleHurt);
            this._bubbleHurtPool.put(bubbleHurt);
        }
    }


    getFreeBullet(){
        for(let i =0;i<this._bulletsArr.length;i++){
            if(!this._bulletsArr[i].active){
                return this._bulletsArr[i]
            }
        }
        return null;
    }

    //发送子弹 攻击对方
    doAttacked(){
        let bullet=this.getFreeBullet();
        if(bullet){
            bullet.stopAllActions();
            bullet.active=true;
            bullet.tag=10086;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150*this._skin.scaleY;
            bullet.runAction(cc.sequence(
                cc.moveBy(this._bulletSpeed,cc.p(0,1500*this._skin.scaleY)),
                cc.callFunc(()=>{
                    bullet.active=false;
                })
            ))
        }
    }

    //承受攻击
    onAttacked(hurt){
        this._currentLifeValue-=hurt;
        if(this._isEnemy){
            this._lifeBar.getComponent(cc.ProgressBar).progress=this._currentLifeValue/this._lifeValue;
            this.showHurt(hurt);
        }
        if(this._currentLifeValue<=0){
            GameCtr.getInstance().getFight().removeAir(this.node);
            this.node.destroy();
        }
    }


    showHurt(hurt){
        let bubbleHurt=null;
        if(this._bubbleHurtPool.size()>0){
            bubbleHurt=this._bubbleHurtPool.get();
            console.log('log---------从对象池中获取bubbleHurt');
        }else{
            bubbleHurt=cc.instantiate(this.bubbleHurt);
            console.log('log---------重新实例化bubbleHurt');
        }
        bubbleHurt.parent=this.node;
        bubbleHurt.active=true;
        bubbleHurt.y=0;
        bubbleHurt.getComponent("BubbleHurt").showHurt(hurt);
        bubbleHurt.stopAllActions();
        bubbleHurt.runAction(cc.sequence(
            cc.moveBy(2,cc.p(0,150)),
            cc.callFunc(()=>{
                bubbleHurt.active=false;
                this._bubbleHurtPool.put(bubbleHurt)
            })
        ))
    }

    //敌人随机移动
    doRandomMove(){
        let randomX=Math.random()*900-450;
        let randomY=600-Math.random()*400;
        let dinstance=cc.pDistance(cc.p(this.node.x,this.node.y),cc.p(randomX,randomY))
        this.node.runAction(cc.sequence(
            cc.moveTo(dinstance/100,cc.p(randomX,randomY)),
            cc.callFunc(()=>{
                this.doRandomMove();
            })
        ))
    }
}
