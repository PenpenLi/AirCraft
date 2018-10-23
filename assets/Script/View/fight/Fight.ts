import GameCtr from "../../Controller/GameCtr";
import GameData from "../../Common/GameData";
import Util from "../../Common/Util";
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _gameBg1=null;
    _gameBg2=null;
    _touchNode=null;
    _lbGameCount=null;
    _otherNode=null;
    _goldFrame=null;
    _lbGold=null;
    _airs=[];
    _selfAirs=[];
    _enemyAirs=[];
    _selfAirsPos=[];
    _bullets=[];
    _interval=0;
    _airTag=0;
    _levelSmall=1;//小关卡

    @property(cc.Prefab)
    airsPrefab:cc.Prefab[]=[];
    
    @property(cc.Prefab)
    gameOver:cc.Prefab=null;

    @property(cc.Prefab)
    strike:cc.Prefab=null;

    @property(cc.Prefab)
    lb_gold:cc.Prefab=null;

    @property(cc.Prefab)
    bubbleHurts:cc.Prefab[]=[];
    
    onLoad(){
        GameData.enemyHP=GameData.enemyHP?GameData.enemyHP:GameData.getEnemyHP();
        GameCtr.getInstance().setFight(this);
        GameCtr.strikePool=new cc.NodePool();
        GameCtr.lbGoldPool=new cc.NodePool();
        GameCtr.lbHurtPool=new cc.NodePool();

        this.initNode();
        this.initEnemys();
        this.initAirs();
        this.initStrikes();
        this.initLbGolds();
        this.initFightTouch();
        this.startBgRoll();
        this.setGameCount();
    }

    initNode(){
        this._otherNode=this.node.getChildByName("otherNode");
        this._gameBg1=this.node.getChildByName("bg1");
        this._gameBg2=this.node.getChildByName("bg2");
        this._touchNode=this.node.getChildByName("touchNode");
        this._lbGameCount=this._otherNode.getChildByName("lb_gameCount");
        this._goldFrame=this._otherNode.getChildByName("goldFrame");
        this._lbGold=this._goldFrame.getChildByName("lb_gold");
        this._lbGold.getComponent(cc.Label).string=Util.formatNumber(GameData.gold);
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
        for(let i=0;i<16;i++){//GameCtr.selfPlanes.length
            //if(GameCtr.selfPlanes[i]<=0){continue;}
            let air = cc.instantiate(this.airsPrefab[0]);
            let level=GameData.getPlaneLevel(GameCtr.selfPlanes[i]);

            let infodata={
                lifeValue:10,//GameData.getPlaneLifeValue(level),
                bulletHurt:30,//GameData.planesConfig[GameCtr.selfPlanes[i]-1].baseAttack+(level-1)*GameData.planesConfig[GameCtr.selfPlanes[i]-1].attackIncrease,
                isEnemy:false,
                level:10,//GameCtr.selfPlanes[i]
            };

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
        this.setGameCount();
        for(let i=0; i<5; i++){
            let enemy = cc.instantiate(this.airsPrefab[0]);
            let infodata={
                lifeValue:GameData.enemyHP,
                bulletHurt:1,
                isEnemy:true,
                level:this._levelSmall
            }
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
        let infoData={
            lifeValue:1*GameData.enemyHP,
            bulletHurt:3,
            isEnemy:true,
            level:Math.floor(Math.random()*5)+1,
            isBoss:true
        };
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
             GameCtr.strikePool.put(strike);
        }
    }

    initLbGolds(){
        for(let i=0;i<5;i++){
            let lbGold=cc.instantiate(this.lb_gold);
            GameCtr.lbGoldPool.put(lbGold);
        }
    }

    initLbHurts(){
        for(let i=0;i<40;i++){
            let bubbleHurt=cc.instantiate(this.bubbleHurts[Math.floor(Math.random()*2)]);
            GameCtr.lbHurtPool.put(bubbleHurt);
        }
    }

    initFightTouch(){
        let touchStep=-1;
        this._touchNode.on(cc.Node.EventType.TOUCH_START,(e)=>{
            touchStep=0;
            for(let i=0;i<this._selfAirs.length;i++){
                this._selfAirs[i].node.stopAllActions();
                this._selfAirs[i].node.rotation=0; 
            }
        });

        this._touchNode.on(cc.Node.EventType.TOUCH_MOVE,(e)=>{
            for(let i=0;i<this._selfAirs.length;i++){
                this._selfAirs[i].node.x+=e.touch._point.x - e.touch._prevPoint.x;
            }

            if(touchStep==0){
                if(e.touch._point.x - e.touch._prevPoint.x>0){//向左偏移
                    for(let i=0;i<this._selfAirs.length;i++){
                        this._selfAirs[i].node.runAction(cc.sequence(
                            cc.rotateBy(0.3, 15),
                            cc.rotateBy(0.3,-15)
                        ))
                    }
                }else{
                    for(let i=0;i<this._selfAirs.length;i++){
                        this._selfAirs[i].node.runAction(cc.sequence(
                            cc.rotateBy(0.3,-15),
                            cc.rotateBy(0.3, 15)
                        ))
                    }
                }
                touchStep=1
            }
        });

        this._touchNode.on(cc.Node.EventType.TOUCH_END,(e)=>{
            touchStep=-1;
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
        let isBoss=false;
        for(let i=0;i<this._enemyAirs.length;i++){
            if(this._enemyAirs[i].info.isBoss){
                isBoss= this._enemyAirs[i].info.isBoss;
            }
            if(air.tag==this._enemyAirs[i].node.tag){
                this._enemyAirs.splice(i,1);
            }
        }
        //敌人战败
        if(this._enemyAirs.length==0 && !isBoss){
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
        if( GameCtr.strikePool.size()>0){
            strike= GameCtr.strikePool.get();
        }else{
            strike=cc.instantiate(this.strike);
        }
        strike.parent=cc.find("Canvas");
        strike.x=pos.x;
        strike.y=pos.y;
        strike.stopAllActions();
        strike.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(()=>{
                GameCtr.strikePool.put(strike);
            })
        ))
    }

    showGold(gold,pos){
        let lbGold=null;
        if(GameCtr.lbGoldPool.size()>0){
            lbGold=GameCtr.lbGoldPool.get();
        }else{
            lbGold=cc.instantiate(this.lb_gold);
            GameCtr.lbGoldPool.put(lbGold);
        }
        lbGold.parent=cc.find("Canvas");
        lbGold.getComponent("lbGold").setValue(gold);
        lbGold.x=pos.x;
        lbGold.y=pos.y;
        let bezier = [cc.v2(pos.x,pos.y), cc.v2(-200, 400), cc.v2(-450, 900)];
        lbGold.runAction(cc.sequence(
            cc.bezierTo(1, bezier),
            cc.callFunc(()=>{
                GameCtr.lbGoldPool.put(lbGold);
                this.addGold(gold);
            })
        ));
    }

    showBossGold(gold,pos){
        for(let i=0;i<5;i++){
            this.node.runAction(cc.sequence(
                cc.delayTime(0.5*i),
                cc.callFunc(()=>{
                    this.showGold(Math.floor(gold/5),{x:pos.x+Math.random()*300-150,y:pos.y+Math.random()*50-25});
                    if(i==4){
                        this.initEnemys();
                    }
                })
            ))
        }
    }

    showPass(){
        this._levelSmall++;
        if(this._levelSmall<10){
            let pass01=this._otherNode.getChildByName("pass_01");
            let pass02=this._otherNode.getChildByName("pass_02");
            pass01.runAction(cc.fadeIn(0));
            pass02.runAction(cc.fadeIn(0));
            pass01.x=-650;
            pass02.x= 650;
            pass01.runAction(cc.sequence(
                cc.moveTo(0.4,cc.p(-80,450)),
                cc.delayTime(0.4),
                cc.fadeOut(0.4)
            ));
    
            pass02.runAction(cc.sequence(
                cc.moveTo(0.4,cc.p(80,450)),
                cc.delayTime(0.4),
                cc.fadeOut(0.4),
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
                cc.moveTo(0.2,cc.p(200-150*i,0)).easing(cc.easeSineInOut()),
                cc.delayTime(0.8),
                cc.moveTo(0.2,cc.p(1600-200*i,0)).easing(cc.easeSineInOut()),
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
        gameOver.getComponent("GameOver").setGold((this._levelSmall-1)*GameData.enemyHP);
    }

    setGameCount(){
        this._lbGameCount.getComponent(cc.Label).string= GameData.fightLevel+"/"+this._levelSmall;
    }

    doUpLevel(){
        this._levelSmall=1;
        GameData.fightLevel+=1;
        GameData.enemyHP=GameData.getEnemyHP();
    }

    addGold(gold){
        this._goldFrame.runAction(cc.sequence(
            cc.scaleTo(0.2,1.2),
            cc.callFunc(()=>{
                this._goldFrame.scale=1.0;
            })
        ))
        GameData.gold+=gold;
        this._lbGold.getComponent(cc.Label).string=Util.formatNumber(GameData.gold);
    }

    resetGame(){
        this._levelSmall=1;
        this.initEnemys();
        this.initAirs();
        this.initFightTouch();
        this.setGameCount();
    }

    onBtnOver(){
        cc.director.pause();
        this.showGameOver();
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
