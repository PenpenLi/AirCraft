import GameData from "../../Common/GameData";
import Util from "../../Common/Util";
import PlaneFrameMG from "../game/PlaneFrameMG";
import AudioManager from "../../Common/AudioManager";
import GameCtr from "../../Controller/GameCtr";
import ViewManager from "../../Common/ViewManager";


const { ccclass, property } = cc._decorator;

const settingNames = ["", "工厂", "仓库", "回收技术", "攻击技术", "暴击技术", "高级回收", "高级攻速", "高级攻击", "高级暴击", "暴击暴伤"];

@ccclass
export default class SettingUpgradeItem extends cc.Component {

    @property(cc.Sprite)
    sprSetting: cc.Sprite = null;
    @property(cc.Sprite)
    sprCoin: cc.Sprite = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbLevel: cc.Label = null;
    @property(cc.Label)
    lbPrice: cc.Label = null;
    @property(cc.Label)
    lbAttribute: cc.Label = null;
    @property(cc.SpriteFrame)
    diamondFrame: cc.SpriteFrame = null;

    // LIFE-CYCLE CALLBACKS:
    private type = 0;
    private price = 0;

    // onLoad () {}

    start() {

    }

    public setType(type) {
        this.type = type;
        this.lbName.string = settingNames[type];
        PlaneFrameMG.setSettingFrame(this.sprSetting, type - 1);
        this.setSettingInfo(type);
        if (type > 5) {
            this.sprCoin.spriteFrame = this.diamondFrame;
        }
    }

    setSettingInfo(type) {
        switch (type) {
            case 1:
                this.lbLevel.string = "等级 " + (GameData.factoryLevel + 1);
                this.lbAttribute.string = "缩短制造时间-" + ((GameData.factoryLevel + 1) * 2) / 10 + "秒";
                this.price = Math.pow(2, GameData.factoryLevel) * 1000;
                break;
            case 2:
                this.lbLevel.string = "等级 " + (GameData.repositoryLevel + 1);
                this.lbAttribute.string = "增加制造库存" + (GameData.repositoryLevel + 1) * 2;
                this.price = Math.pow(2, GameData.repositoryLevel) * 1000;
                break;
            case 3:
                this.lbLevel.string = "等级 " + (GameData.recycleLevel + 1);
                this.lbAttribute.string = "增加金币获得" + 5 * (GameData.recycleLevel + 1) + "%";
                this.price = Math.pow(2, GameData.recycleLevel) * 1000;
                break;
            case 4:
                this.lbLevel.string = "等级 " + (GameData.attackLevel + 1);
                this.lbAttribute.string = "增加飞机攻击力" + (GameData.attackLevel + 1) + "%";
                this.price = Math.pow(2, GameData.attackLevel) * 1000;
                break;
            case 5:
                this.lbLevel.string = "等级 " + (GameData.criticalStrikeLevel + 1);
                this.lbAttribute.string = "增加飞机暴击率" + (GameData.criticalStrikeLevel + 1) + "%";
                this.price = Math.pow(2, GameData.criticalStrikeLevel) * 1000;
                break;
            case 6:
                this.lbLevel.string = "等级 " + (GameData.highRecycleLevel + 1);
                this.lbAttribute.string = "增加金币获得" + 5 * (GameData.highRecycleLevel + 1) + "%";
                this.price = (GameData.highRecycleLevel + 1) * 100;
                break;
            case 7:
                this.lbLevel.string = "等级 " + (GameData.highAttackSpeed + 1);
                this.lbAttribute.string = "飞机射击速度" + (GameData.highAttackSpeed + 1) + "%";
                this.price = (GameData.highAttackSpeed + 1) * 100;
                break;
            case 8:
                this.lbLevel.string = "等级 " + (GameData.highAttack + 1);
                this.lbAttribute.string = "增加飞机攻击力" + (GameData.highAttack + 1) + "%";
                this.price = (GameData.highAttack + 1) * 100;
                break;
            case 9:
                this.lbLevel.string = "等级 " + (GameData.highCriticalStrike + 1);
                this.lbAttribute.string = "增加飞机暴击率" + (GameData.highCriticalStrike + 1) + "%";
                this.price = (GameData.highCriticalStrike + 1) * 100;
                break;
            case 10:
                this.lbLevel.string = "等级 " + (GameData.forceCriticalStrike + 1);
                this.lbAttribute.string = "增加飞机暴击伤害" + (GameData.forceCriticalStrike + 1) + "%";
                this.price = (GameData.forceCriticalStrike + 1) * 100;
                break;
        }
        this.lbPrice.string = Util.formatNum(this.price);
    }

    clickUpgrade() {
        if (this.type <= 5) {
            if (GameData.gold >= this.price) {
                GameData.gold -= this.price;
            }else{
                ViewManager.toast("金币不足！");
                return;
            }
        } else {
            if (GameData.diamonds >= this.price) {
                GameData.diamonds -= this.price;
            }else{
                ViewManager.toast("钻石不足！");
                return;
            }
        }
        switch (this.type) {
            case 1:
            GameData.factoryLevel++;
                break;
            case 2:
            GameData.repositoryLevel++;
                break;
            case 3:
            GameData.recycleLevel++;
                break;
            case 4:
            GameData.attackLevel++;
                break;
            case 5:
            GameData.criticalStrikeLevel++;
                break;
            case 6:
            GameData.highRecycleLevel++;;
                break;
            case 7:
            GameData.highAttackSpeed++;
                break;
            case 8:
            GameData.highAttack++;
                break;
            case 9:
            GameData.highCriticalStrike++;
                break;
            case 10:
            GameData.forceCriticalStrike++;
                break;
        }
        GameCtr.ins.mGame.setDiamonds();
        this.setSettingInfo(this.type);
        AudioManager.getInstance().playSound("audio/sound_p7_up", false);
    }

    // update (dt) {}
}
