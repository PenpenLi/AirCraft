import PlaneFrameMG from "../game/PlaneFrameMG";
import GameData from "../../Common/GameData";
import Util from "../../Common/Util";

const {ccclass, property} = cc._decorator;

let planesConfig = [
    {name: "1 卡普", baseAttack: 2, attackIncrease: 1, basePrice: 2},
    {name: "2 喷火", baseAttack: 5, attackIncrease: 2, basePrice: 4},
    {name: "3 米格-3", baseAttack: 12, attackIncrease:4, basePrice: 10},
    {name: "4 雅克-1", baseAttack: 30, attackIncrease: 8, basePrice: 22},
    {name: "5 未来", baseAttack: 75, attackIncrease: 16, basePrice: 48},
    {name: "6 F2A-1", baseAttack: 200, attackIncrease: 32, basePrice: 104},
    {name: "7 F2A-3", baseAttack: 500, attackIncrease: 64, basePrice: 224},
    {name: "8 莱特-11", baseAttack: 1250, attackIncrease: 125, basePrice: 468},
    {name: "9 海豚", baseAttack: 3200, attackIncrease: 250, basePrice: 1000},
    {name: "10 迅雷", baseAttack: 8000, attackIncrease: 500, basePrice: 2125},
    {name: "11 蝙蝠", baseAttack: 20000, attackIncrease: 1000, basePrice: 4500},
    {name: "12 b5", baseAttack: 50000, attackIncrease: 2000, basePrice: 9500},
    {name: "13 鲨鱼", baseAttack: 125000, attackIncrease: 4000, basePrice: 20000},
    {name: "14 罪恶", baseAttack: 320000, attackIncrease: 8000, basePrice: 42000},
    {name: "15 Y613", baseAttack: 800000, attackIncrease: 16000, basePrice: 88000},
    {name: "16 宇宙", baseAttack: 2000000, attackIncrease: 32000, basePrice: 184000},
    {name: "17 战甲", baseAttack: 5000000, attackIncrease: 64000, basePrice: 384000},
    {name: "18 帝国", baseAttack: 12500000, attackIncrease: 125000, basePrice: 781250},
    {name: "19 挑战", baseAttack: 32000000, attackIncrease: 250000, basePrice: 1625000},
    {name: "20 Falco-3", baseAttack: 80000000, attackIncrease: 500000, basePrice: 3375000},
    {name: "21 Falco-7", baseAttack: 200000000, attackIncrease: 1000000, basePrice: 7000000},
    {name: "22 Falco-9", baseAttack: 500000000, attackIncrease: 2000000, basePrice: 14500000},
    {name: "23 天启", baseAttack: 1250000000, attackIncrease: 4000000, basePrice: 29660000},
    {name: "24 光棱", baseAttack: 3200000000, attackIncrease: 8000000, basePrice: 62720000},
    {name: "25 天神", baseAttack: 8000000000, attackIncrease: 16000000, basePrice: 129380000}
];

const baseLife = 2;

@ccclass
export default class PlaneUpgradeItem extends cc.Component {

    @property(cc.Sprite)
    sprPlane: cc.Sprite = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbLevel: cc.Label = null;
    @property(cc.Label)
    lbPrice: cc.Label = null;
    @property(cc.Label)
    lbAttribute: cc.Label = null;

    private level = 1;
    private idx = 1;
    private info = null;
    private price = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    public setData(data) {
        this.idx = data.idx;
        this.level = data.level;
        PlaneFrameMG.setPlaneFrame(this.sprPlane, data.idx);
        this.info = planesConfig[data.idx-1];
        this.lbName.string = this.info.name;
        this.setLevel(this.level);
    }

    private setLevel(level){
        this.lbLevel.string = "等级 "+level;
        let attact = this.info.baseAttack+this.info.attackIncrease*(level-1);
        let life = baseLife;
        if(level > 100) {
            life = 6;
        }else{
            life += Math.floor(level / 25);
        }
        this.lbAttribute.string = "攻击"+attact+" 生命"+life;
        this.price = this.info.basePrice*level;
        this.lbPrice.string = Util.formatNum(this.price);
    }

    clickUpgrade() {
        if(GameData.gold >= this.price){
            this.setLevel(++this.level);
            GameData.gold -= this.price;
            GameData.setPlaneLevel(this.idx, this.level);
        }
    }

    // update (dt) {}
}
