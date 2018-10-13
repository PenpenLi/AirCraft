import GameCtr from "../../Controller/GameCtr";


const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _lifeValue=null;
    _bulletHurt=null;
    _bulletSpeed=3;
    _attackInterval=2;
    _bulletsArr=[];
    _skin=null;
   
    @property(cc.Prefab)
    bullet:cc.Prefab=null;

    onLoad(){
        
        this.initBullets();
    }

    startAttack(){
        this.schedule(this.doAttacked, this._attackInterval);
    }


    setData(data){
        this._lifeValue=data.lifeValue;
        this._bulletHurt=data.bulletHurt;

        this.initBullets();
    }

    

    initBullets(){
        for(let i=0;i<3;i++){
            let bullet =cc.instantiate(this.bullet);
            bullet.parent=cc.find("Canvas");
            bullet.active=false;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150;
            this._bulletsArr.push(bullet);
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
            let bulletsLength=GameCtr.getInstance().getFight().getBulletsLength();
            bullet.stopAllActions();
            bullet.tag=bulletsLength;
            bullet.active=true;
            bullet.x=this.node.x;
            bullet.y=this.node.y+150;
            bullet.runAction(cc.sequence(
                cc.moveBy(this._bulletSpeed,cc.p(0,1500)),
                cc.callFunc(()=>{
                    bullet.active=false;
                    GameCtr.getInstance().getFight().removeBullet(bullet);
                })
            ))
            GameCtr.getInstance().getFight().addBullet(bullet);
        }
    }

    //承受攻击
    onAttacked(hurt){
        console.log("log--------------onAttacked---hurt=:",hurt);
        this._lifeValue-=hurt;
        if(this._lifeValue<=0){
            this.node.destroy();
            /**
            * 播放爆炸动画
            */
        }
    }


   








}
