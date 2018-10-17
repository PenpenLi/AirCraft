import GameCtr from "../../Controller/GameCtr";
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _gameBg1=null;
    _gameBg2=null;
    _touchNode=null;
    _lbGameCount=null;
    _otherNode=null;
    _strikePool=null;
    _airs=[];
    _selfAirs=[];
    _enemyAirs=[];
    _selfAirsPos=[];
    _bullets=[];
   
    _interval=0;
    _airTag=0;
    _levelSmall=1;//小关卡
    _levelBig=1;  //大关卡
    
    @property(cc.Prefab)
    airsPrefab:cc.Prefab[]=[];
    
    @property(cc.Prefab)
    gameOver:cc.Prefab=null;

    @property(cc.Prefab)
    strike:cc.Prefab=null;
    
    onLoad(){
        GameCtr.getInstance().setFight(this);
        this._strikePool=new cc.NodePool();
        this.initNode();
        this.initEnemys();
        this.initAirs();
        this.initStrikes();
        this.initFightTouch();
        this.startBgRoll();
        this.setGameCount();
    }

    initNode(){
        this._otherNode=this.node.getChildByName("otherNode");
        this._gameBg1=this.node.getChildByName("bg1");
        this._gameBg2=this.node.getChildByName("bg2");
        this._touchNode=this.node.getChildByName("touchNode");
        this._lbGameCount=this.node.getChildByName("lb_gameCount");
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
        for(let i=0;i<5;i++){
            let air = cc.instantiate(this.airsPrefab[0]);
            let infodata={lifeValue:3,bulletHurt:1,isEnemy:false,level:1}
            air.parent=cc.find("Canvas");
            air.tag=this._airTag;
            air.getComponent("Air").init(infodata);
            air.getComponent("Air").startAttack();
            this.addAir({node:air,info:infodata});
            this.addSelfAir({node:air,info:infodata});
            this._airTag++;
        }
        this.placeAirs()
    }


    initEnemys(){
        for(let i=0; i<5; i++){
            let enemy = cc.instantiate(this.airsPrefab[0]);
            let infodata={lifeValue:5,bulletHurt:1,isEnemy:true,level:this._levelSmall}
            enemy.parent=cc.find("Canvas");
            enemy.tag=this._airTag;
            enemy.x=-200+i*200;
            enemy.y=800;
            enemy.getComponent("Air").init(infodata);
            enemy.getComponent("Air").startAttack();
            enemy.getComponent("Air").doRandomMove();
            this.addAir({node:enemy,info:infodata});
            this.addEnemyAir({node:enemy,info:infodata})
            this._airTag++;
        }
    }

    initBoss(){
        let boss=cc.instantiate(this.airsPrefab[0]);
        let infoData={lifeValue:10,bulletHurt:3,isEnemy:true,level:Math.floor(Math.random()*6),isBoss:true};
        boss.parent=cc.find("Canvas");
        boss.y=600;
        boss.getComponent("Air").init(infoData);
        boss.getComponent("Air").startAttack();
        this.addAir({node:boss,info:infoData});
        this.addEnemyAir({node:boss,info:infoData})
        this._airTag++;
    }

    initStrikes(){
        for(let i=0;i<30;i++){
            let strike=cc.instantiate(this.strike);
            this._strikePool.put(strike);
        }
    }

    initFightTouch(){
        this._touchNode.on(cc.Node.EventType.TOUCH_START,(e)=>{
        });

        this._touchNode.on(cc.Node.EventType.TOUCH_MOVE,(e)=>{
            for(let i=0;i<this._selfAirs.length;i++){
                this._selfAirs[i].node.x+=e.touch._point.x - e.touch._prevPoint.x;
            }
        });

        this._touchNode.on(cc.Node.EventType.TOUCH_END,(e)=>{

        })
    }


    addAir(air){
        this._airs.push(air);
    }

    addSelfAir(air){
        this._selfAirs.push(air);
    }

    addEnemyAir(air){
        this._enemyAirs.push(air);
    }

    removeAir(air){
        for(let i=0;i<this._airs.length;i++){
            if(air.tag==this._airs[i].node.tag){
                this._airs.splice(i,1);
            }
        }

        this.romoveSelfAir(air);
        this.removeEnemyAir(air);
    }

    romoveSelfAir(air){
        for(let i=0;i<this._selfAirs.length;i++){
            if(air.tag==this._selfAirs[i].node.tag){
                this._selfAirs.splice(i,1);
            }
        }
        //己方战败
        if(this._selfAirs.length==0){
            this.clear();
            this.showGameOver();
        }
    }

    removeEnemyAir(air){
        if(this._enemyAirs.length==0){return;}
        for(let i=0;i<this._enemyAirs.length;i++){
            if(air.tag==this._enemyAirs[i].node.tag){
                this._enemyAirs.splice(i,1);
            }
        }
        //敌人战败
        if(this._enemyAirs.length==0){
           this.showPass();
        }
    }

    placeAirs(){
        let formation=this.getAirsformation();
        let line=0;
        let startPosY=-800;
        for(let i=0;i<formation.length;i++){
            if(formation[i].length>0){
                line++;
            }
        }
        startPosY=-800+100*(line-1);
        for(let i=0;i<formation.length;i++){
            for(let j=0;j<formation[i].length;j++){
                formation[i][j].node.x=0-(formation[i].length-1)*70+j*140;
                formation[i][j].node.y=startPosY-150*(i-1);
            }
        }
    }

    getAirsformation(){
        let formation=[];
        for (let i=0; i<6; i++){
            formation.push([])
        }
        for(let i=0;i<this._selfAirs.length;i++){
            if(i<=0){
                formation[0].push(this._selfAirs[i]);
            }else if(i>0 && i<=2){
                formation[1].push(this._selfAirs[i]);
            }else if(i>2 && i<=5){
                formation[2].push(this._selfAirs[i]);
            }else if(i>5 && i<=9){
                formation[3].push(this._selfAirs[i]);
            }else if(i>9 && i<=14){
                formation[4].push(this._selfAirs[i]);
            }else{
                formation[5].push(this._selfAirs[i]);
            }
        }
        return formation;
    }

    getCurrentBullets(){
        while(cc.find("Canvas").getChildByTag(10086)){
            let buttet=cc.find("Canvas").getChildByTag(10086);
            buttet.tag=10;
            this._bullets.push(buttet);
        }
    }

    showStrike(pos){
        let strike=null;
        if(this._strikePool.size()>0){
            strike=this._strikePool.get();
            console.log('log---------从对象池中获取strike-----');
        }else{
            strike=cc.instantiate(this.strike);
            console.log('log---------重新实例化strike对象-----');
        }
        strike.parent=cc.find("Canvas");
        strike.x=pos.x;
        strike.y=pos.y;
        strike.stopAllActions();
        strike.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(()=>{
                this._strikePool.put(strike);
            })
        ))
    }

    showPass(){
        this._levelSmall++;
        this.setGameCount();
        if(this._levelSmall<10){
            let pass01=this._otherNode.getChildByName("pass_01");
            let pass02=this._otherNode.getChildByName("pass_02");
            pass01.runAction(cc.fadeIn(0));
            pass02.runAction(cc.fadeIn(0));
            pass01.x=-650;
            pass02.x= 650;
            pass01.runAction(cc.sequence(
                cc.moveTo(0.5,cc.p(-80,450)),
                cc.delayTime(0.5),
                cc.fadeOut(0.5)
            ));
    
            pass02.runAction(cc.sequence(
                cc.moveTo(0.5,cc.p(80,450)),
                cc.delayTime(0.5),
                cc.fadeOut(0.5),
                cc.callFunc(()=>{
                    this.initEnemys();
                })
            ));
        }else{
            this.showBossComming();
        }
    }

    showBossComming(){
        let word_boss=this._otherNode.getChildByName("word_boss");

        for(let i=0;i<4;i++){
            let word=word_boss.getChildByName(i+"");
            word.x=-935;
            word.runAction(cc.sequence(
                cc.delayTime(i*0.2),
                cc.moveTo(0.3,cc.p(200-150*i,0)).easing(cc.easeSineInOut()),
                cc.delayTime(1),
                cc.moveTo(0.3,cc.p(1600-200*i,0)).easing(cc.easeSineInOut()),
            ))
        }

        this.node.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(()=>{
                this.initBoss();
            })
        ))
    }

    showGameOver(){
        if(cc.find("Canvas").getChildByName("gameOver")){
            return;
        }

        let gameOver=cc.instantiate(this.gameOver);
        gameOver.parent=cc.find("Canvas");
    }

    setGameCount(){
        this._lbGameCount.getComponent(cc.Label).string=this._levelBig+"/"+this._levelSmall;
    }

    doUpLevel(){
        this._levelSmall=0;
        this._levelBig++;
    }

    resetGame(){
        this._levelSmall=1;
        this.initEnemys();
        this.initAirs();
        this.initFightTouch();
        this.setGameCount();
    }

    clear(){
        for(let i=0;i<this._airs.length;i++){
            this._airs[i].node.destroy();
        }
        
        while(cc.find("Canvas").getChildByTag(10086)){
            cc.find("Canvas").removeChildByTag(10086);
        }

        this._enemyAirs.splice(0,this._enemyAirs.length);
        this._selfAirs.splice(0,this._selfAirs.length);
        this._airs.splice(0,this._airs.length);
        this._bullets.splice(0,this._bullets.length);
        
    }


    update(dt){
        this._interval+=dt;
        
        if(this._interval>=0.1){
            this.getCurrentBullets();
            for(let i=0;i<this._airs.length;i++){
                for(let j=0;j<this._bullets.length;j++){
                    if( this._airs[i] && this._bullets[j] && this._bullets[j].active && this._bullets[j].getComponent("Bullet").getIsEmeny()!=this._airs[i].info.isEnemy &&cc.rectContainsPoint(this._airs[i].node.getBoundingBox(),cc.p(this._bullets[j].x,this._bullets[j].y))){
                        this._bullets[j].active=false;
                        this.showStrike({x:this._bullets[j].x,y:this._bullets[j].y});
                        this._airs[i].node.getComponent("Air").onAttacked(this._bullets[j].getComponent("Bullet").getHurt());
                    }
                }
            }
            this._interval=0;
        }
    } 
}
