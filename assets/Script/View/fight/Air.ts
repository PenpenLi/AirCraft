import GameCtr from "../../Controller/GameCtr";
import NodePoolManager from "../../Common/NodePoolManager";
import AudioManager from "../../Common/AudioManager";
import GameData from "../../Common/GameData";
enum Attack{
    UP=1,
    DOWN=-1
}

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _lifeValue=null;
    _currentLifeValue=null;
    _level=null;
    _bulletHurt=null;
    _deadEft=null;
    _bulletSpeed=1.8;
    _attackInterval=1;
    _attackDelay=1;
    _bulletsArr=[];
    _skin=null;
    _lifeBar=null;
    _isEnemy=false;
    _isBoss=false;
    _attackDirection=null;
    _bulletCount=0;
    _goldIncrease=0;
    _bonus=0;

    @property(cc.SpriteFrame)
    enemySkins:cc.SpriteFrame[]=[];

    @property(cc.SpriteFrame)
    bossSkins:cc.SpriteFrame[]=[];

    @property(cc.SpriteFrame)
    selfSkins:cc.SpriteFrame[]=[];

    @property(cc.Prefab)
    bubbleHurts:cc.Prefab[]=[];
   
    @property(cc.Prefab)
    bullet:cc.Prefab=null;

    @property(cc.Prefab)
    deadEft:cc.Prefab=null;

    onLoad(){
        this._skin=this.node.getComponent(cc.Sprite);
        this._lifeBar=this.node.getChildByName("lifeBar");
        this._lifeBar.active=false;
    }

    startAttack(){
        if(this._isBoss){
            this._attackInterval=0.2;
            this._attackDelay=0.5;
        }else if(this._isEnemy){
            this._attackInterval=3.0;
            this._attackDelay=2.0;
        }else {
            this._attackInterval=0.6;
            this._attackDelay=0.5;
        }
        this.schedule(this.doAttack, this._attackInterval,cc.macro.REPEAT_FOREVER,this._attackDelay);
    }

    init(data){
        this._lifeValue=data.lifeValue;
        this._bulletHurt=data.bulletHurt;
        this._currentLifeValue=data.lifeValue;
        this._isEnemy=data.isEnemy;
        this._isBoss=data.isBoss;
        this._level=data.level;
        this._bonus=data.bonus;
        this._attackDirection=this._isEnemy?Attack.DOWN:Attack.UP;
        this._bulletCount=this._isBoss?30:10;
        this._goldIncrease=GameData.getRecycleGoldIncrease();

        this.initBullets();
        this.initDeadEft();
        this.setSkin();
        if(this._isEnemy){
            this._lifeBar.active=true;
            this._lifeBar.getComponent(cc.ProgressBar).progress=1;
        }
        if(this._isBoss){
            this._lifeBar.y+=100;
        }
    }


    initBullets(){
        for(let i=0;i<this._bulletCount;i++){
            let bullet =cc.instantiate(this.bullet);
            bullet.parent=cc.find("Canvas");
            bullet.active=false;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150;

            bullet.getComponent("Bullet").init({hurt:this._bulletHurt,isEnemy:this._isEnemy,level:this._level,isBoss:this._isBoss})
            this._bulletsArr.push(bullet);
        }
    }

    initDeadEft(){
        this._deadEft=cc.instantiate(this.deadEft);
        this._deadEft.parent=cc.find("Canvas");
        this._deadEft.active=false;
    }

    setSkin(){
        if(this._isBoss){
            this._skin.spriteFrame=this.bossSkins[this._level-1];
            return;
        }
        if(this._isEnemy){
            this._skin.spriteFrame=this.enemySkins[this._level-1];
        }else{
            this._skin.spriteFrame=this.selfSkins[this._level-1];
        }
    }


    getFreeBullet(){
        for(let i =0;i<this._bulletsArr.length;i++){
            if(!this._bulletsArr[i].active){
                return this._bulletsArr[i];
            }
        }
        return null;
    }

    //发送子弹 攻击对方
    doAttack(){
        let bullet=this.getFreeBullet();
        let targetPosX=this._isBoss?Math.random()*1400-700:0
       
        if(bullet){
            GameCtr.getInstance().getFight().addBullet(bullet);
            bullet.stopAllActions();
            bullet.active=true;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150*this._attackDirection;
            bullet.runAction(cc.sequence(
                cc.moveBy(this._bulletSpeed,cc.p(targetPosX,1500*this._attackDirection)),
                cc.callFunc(()=>{
                    bullet.active=false;
                    GameCtr.getInstance().getFight().removeBullet(bullet);
                })
            ))
        }
    }

    stopAttack(){
        this.unscheduleAllCallbacks();
    }

    //承受攻击
    onAttacked(hurt){
        if(this._isBoss || this._isEnemy){
            hurt=GameCtr.doubleAttack?hurt*2:hurt;
        }
        //AudioManager.getInstance().playSound("audio/hit", false);
        
        this._currentLifeValue-=hurt;
        if(this._isEnemy){
            this._lifeBar.getComponent(cc.ProgressBar).progress=this._currentLifeValue/this._lifeValue;
            this.showHurt(hurt);
        }
        if(this._currentLifeValue<=0){
            if(this._isEnemy){
                this._bonus=GameCtr.doubleGold?this._bonus*2*GameCtr.attactGoldRate*(1+this._goldIncrease):this._bonus*GameCtr.attactGoldRate*(1+this._goldIncrease);
                GameCtr.getInstance().getFight().showGold(this._bonus,{x:this.node.x,y:this.node.y});
            }

            if(this._isBoss){
                GameCtr.getInstance().getFight().doUpLevel();
                this._bonus=GameCtr.doubleGold?this._bonus*2*GameCtr.attactGoldRate:this._bonus*GameCtr.attactGoldRate;
                GameCtr.getInstance().getFight().showBossGold(this._bonus,{x:this.node.x,y:this.node.y});
            }
            AudioManager.getInstance().playSound("audio/boom", false);
            GameCtr.getInstance().getFight().removeAir(this.node);
            this.showDeadEft();
        }
    }


    showHurt(hurt){
        hurt=hurt>this._currentLifeValue?this._currentLifeValue:hurt;
        if(hurt<=0){return;}

        let bubbleHurt=null;
        let randnum=Math.random();
        if(GameCtr.lbHurtPool.size()>0){
            bubbleHurt=GameCtr.lbHurtPool.get();
        }else{
            bubbleHurt=cc.instantiate(this.bubbleHurts[Math.floor(Math.random()*2)]);
            GameCtr.lbHurtPool.put(bubbleHurt)
        }
        bubbleHurt.parent=cc.find("Canvas");
        bubbleHurt.active=true;
        bubbleHurt.scale=1.0;
        bubbleHurt.x=this.node.x;
        bubbleHurt.y=this.node.y;
        bubbleHurt.getComponent("BubbleHurt").showHurt(hurt);
        bubbleHurt.stopAllActions();
        if(randnum>0 && randnum<0.2){
            this.bubbleHertAction2(bubbleHurt)
        }else{
            this.bubbleHertAction1(bubbleHurt);
        }
    }


    bubbleHertAction1(bubbleHurt){
        bubbleHurt.runAction(cc.sequence(
            cc.moveBy(1,cc.p(0,80)),
            cc.callFunc(()=>{
                bubbleHurt.active=false;
                if(GameCtr.lbHurtPool){
                    GameCtr.lbHurtPool.put(bubbleHurt);
                }
            })
        ))
    }

    bubbleHertAction2(bubbleHurt){
        bubbleHurt.runAction(cc.sequence(
            cc.spawn(
                cc.moveBy(1,cc.p(0,80)),
                cc.scaleTo(1,1.5),
            ),
            cc.callFunc(()=>{
                bubbleHurt.active=false;
                if(GameCtr.lbHurtPool){
                    GameCtr.lbHurtPool.put(bubbleHurt);
                }
            })
        ))
    }

    showDeadEft(){
        this._deadEft.active=true;
        this._deadEft.x=this.node.x;
        this._deadEft.y=this.node.y;
        this._deadEft.getComponent(cc.Animation).play();

        /*收集子弹，后续清理*/
        for(let i=0;i<this._bulletsArr.length;i++){
            GameCtr.getInstance().getFight().collectInvalidBullet(this._bulletsArr[i]);
        }
        
        this.node.destroy();
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
