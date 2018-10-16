
const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    _hurt:null;
    _isEnemy:null;

    init(data){
        this._hurt=data.hurt;
        this._isEnemy=data.isEnemy;
    }

    getIsEmeny(){
        return this._isEnemy;
    }

    getHurt(){
        return this._hurt;
    }
}
