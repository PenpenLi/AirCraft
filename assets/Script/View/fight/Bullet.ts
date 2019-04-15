
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _skin=null;
    _hurt=null;
    _isEnemy=null;
    _isBoss=null;
    _level=null;


    @property(cc.SpriteFrame)
    enemyBulletSkins:cc.SpriteFrame[]=[];
    
    @property(cc.SpriteFrame)
    selfBulletSkins:cc.SpriteFrame[]=[];

    @property(cc.SpriteFrame)
    bossBulletSkins:cc.SpriteFrame[]=[];

   
    init(data){
        this._hurt=data.hurt;
        this._isEnemy=data.isEnemy;
        this._level=data.level;
        this._isBoss=data.isBoss;
        this.setSkin();
    }

    setSkin(){
        this._skin=this.node.getComponent(cc.Sprite);
        if(this._isBoss){
            this._skin.spriteFrame=this.bossBulletSkins[this._level-1];
            return;
        }
        if(this._isEnemy){
            this._skin.spriteFrame=this.enemyBulletSkins[this._level-1];
        }else{
            this._skin.spriteFrame=this.selfBulletSkins[this._level-1];
        }
    }

    getIsEmeny(){
        return this._isEnemy;
    }

    getHurt(){
        return this._hurt;
    }

    
}
