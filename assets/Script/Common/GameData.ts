import GameCtr from "../Controller/GameCtr";
import WXCtr from "../Controller/WXCtr";
import Guide from "../View/game/Guide";
import UserManager from "./UserManager";
import HttpCtr from "../Controller/HttpCtr";
import Util from "./Util";


const { ccclass, property } = cc._decorator;

const dataKeyConfig = {
    repPlaneNum: "data_1",                                                      //仓库飞机数量
    factoryLevel: "data_2",                                                     //工厂等级
    repositoryLevel: "data_3",                                                  //仓库等级
    recycle: "data_4",                                                          //回收技术
    attack: "data_5",                                                           //攻击技术
    criticalStrike: "data_6",                                                   //暴击技术
    highRecycle: "data_7",                                                      //高级回收
    highAttackSpeed: "data_8",                                                  //高级攻速
    highAttack: "data_9",                                                       //高级攻击
    highCriticalStrike: "data_10",                                              //高级暴击
    forceCriticalStrike: "data_11",                                             //暴击暴伤
    vipLevel: "data_12",                                                        //VIP等级
    guideStep: "data_13",
    freeDiamondCount: "data_14",                                                 //领取免费钻石奖励次数
    fightLevel: "level",                                                       //战斗等级
    enemyHP: "data_16",                                                          //当前关卡敌人血量  
    baseBonus: "data_17",                                                        //当前关卡基础奖励
};


@ccclass
export default class GameData {

    private static _gold: number = 0;                               //金币数量
    private static _diamond: number = 0;                                //钻石数量
    private static _maxPlaneLevel: number = 1;                          //个人拥有的飞机最高等级   
    private static _repPlaneNum: number = 0;                            //仓库飞机数量
    private static _factoryLevel: number = 0;                           //工厂等级
    private static _repositoryLevel: number = 0;                        //仓库等级
    private static _recycleLevel: number = 0;                           //回收技术等级
    private static _attack: number = 0;                                 //攻击技术等级
    private static _criticalStrike: number = 0;                         //暴击技术等级
    private static _highRecycle: number = 0;                            //高级回收等级
    private static _highAttackSpeed: number = 0;                        //高级攻速等级
    private static _highAttack: number = 0;                             //高级攻击等级
    private static _highCriticalStrike: number = 0;                     //高级暴击等级
    private static _forceCriticalStrike: number = 0;                    //暴击暴伤等级
    private static _vipLevel: number = 0;                               //vip等级
    private static _lotteryTimes: number = 0;                           //宝箱抽奖次数
    private static _freeDiamondCount: number = 0;                        //领取免费钻石奖励次数  
    private static _fightLevel: number = 1;                              //战斗等级  
    private static _enemyHP: number = 0;                                 //当前关卡敌人血量  
    private static _baseBonus: number = 0;                               //当前关卡基础奖励         

    public static saveTime = null;                                      //保存数据时间戳

    public static offLineProfit: number = 0;

    public static missionData = null;                                //今日任务数据

    public static planeData = {};
    public static maxPlane = 25;                                        //飞机等级上限
    private static maxApron = 15;

    private static baseProduceTime = 10;                                //基础制造时间
    private static baseRepository = 8;                                  //基础仓库容量

    public static basePlaneLevel = 1;                                   //基础飞机等级

    static planesConfig = [
        { name: "1 卡普", baseAttack: 2, attackIncrease: 1, basePrice: 2 },
        { name: "2 喷火", baseAttack: 5, attackIncrease: 2, basePrice: 4 },
        { name: "3 米格-3", baseAttack: 12, attackIncrease: 4, basePrice: 10 },
        { name: "4 雅克-1", baseAttack: 30, attackIncrease: 8, basePrice: 22 },
        { name: "5 未来", baseAttack: 75, attackIncrease: 16, basePrice: 48 },
        { name: "6 F2A-1", baseAttack: 200, attackIncrease: 32, basePrice: 104 },
        { name: "7 F2A-3", baseAttack: 500, attackIncrease: 64, basePrice: 224 },
        { name: "8 莱特-11", baseAttack: 1250, attackIncrease: 125, basePrice: 468 },
        { name: "9 海豚", baseAttack: 3200, attackIncrease: 250, basePrice: 1000 },
        { name: "10 迅雷", baseAttack: 8000, attackIncrease: 500, basePrice: 2125 },
        { name: "11 蝙蝠", baseAttack: 20000, attackIncrease: 1000, basePrice: 4500 },
        { name: "12 b5", baseAttack: 50000, attackIncrease: 2000, basePrice: 9500 },
        { name: "13 鲨鱼", baseAttack: 125000, attackIncrease: 4000, basePrice: 20000 },
        { name: "14 罪恶", baseAttack: 320000, attackIncrease: 8000, basePrice: 42000 },
        { name: "15 Y613", baseAttack: 800000, attackIncrease: 16000, basePrice: 88000 },
        { name: "16 宇宙", baseAttack: 2000000, attackIncrease: 32000, basePrice: 184000 },
        { name: "17 战甲", baseAttack: 5000000, attackIncrease: 64000, basePrice: 384000 },
        { name: "18 帝国", baseAttack: 12500000, attackIncrease: 125000, basePrice: 781250 },
        { name: "19 挑战", baseAttack: 32000000, attackIncrease: 250000, basePrice: 1625000 },
        { name: "20 Falco-3", baseAttack: 80000000, attackIncrease: 500000, basePrice: 3375000 },
        { name: "21 Falco-7", baseAttack: 200000000, attackIncrease: 1000000, basePrice: 7000000 },
        { name: "22 Falco-9", baseAttack: 500000000, attackIncrease: 2000000, basePrice: 14500000 },
        { name: "23 天启", baseAttack: 1250000000, attackIncrease: 4000000, basePrice: 29660000 },
        { name: "24 光棱", baseAttack: 3200000000, attackIncrease: 8000000, basePrice: 62720000 },
        { name: "25 天神", baseAttack: 8000000000, attackIncrease: 16000000, basePrice: 129380000 }
    ];

    static planeProfits = [
        0,
        33,
        66,
        157,
        364,
        803,
        1706,
        3537,
        7224,
        14623,
        29446,
        59117,
        118484,
        237243,
        474786,
        949897,
        1900144,
        3800663,
        7601726,
        15203877,
        30408204,
        60816883,
        121634266,
        243269057,
        486538664,
        973077903
    ];

    static planeGift = [0, 0, 0, 0, 0,
        24000,
        52100,
        112220,
        234460,
        501000,
        1060000,
        2250000,
        4680000,
        9720000,
        20130000,
        41600000,
        85800000,
        176640000,
        363090000,
        745290000,
        1527840000,
        3128430000,
        6399060000,
        13076340000,
        26697520000,
        54462940000
    ];

    static baseEnemy = {
        monsterHP: 30,
        bossHP: 900,
        baseBonus: 10,
        bonus: 40,
    }

    // 设置回收技术等级
    static set recycleLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._recycleLevel = level;
        GameData.setUserData({ recycle: GameData._recycleLevel });
    }

    // 获取回收技术等级
    static get recycleLevel() {
        return GameData._recycleLevel;
    }

    // 设置仓库飞机数量
    static set repPlaneNum(num) {
        if (num < 0) {
            num = 0;
        }
        GameData._repPlaneNum = num;
        GameData.setUserData({ repPlaneNum: GameData._repPlaneNum });
    }

    // 获取仓库飞机数量
    static get repPlaneNum() {
        return GameData._repPlaneNum;
    }

    // 设置攻击技术等级
    static set attackLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._attack = level;
        GameData.setUserData({ attack: GameData._attack });
    }

    // 获取攻击技术等级
    static get attackLevel() {
        return GameData._attack;
    }

    // 设置暴击技术等级
    static set criticalStrikeLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._criticalStrike = level;
        GameData.setUserData({ criticalStrike: GameData._criticalStrike });
    }

    // 获取暴击技术等级
    static get criticalStrikeLevel() {
        return GameData._criticalStrike;
    }

    // 设置高级回收技术等级
    static set highRecycleLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._highRecycle = level;
        GameData.setUserData({ highRecycle: GameData._highRecycle });
    }

    // 获取高级回收技术等级
    static get highRecycleLevel() {
        return GameData._highRecycle;
    }

    // 设置高级攻速等级
    static set highAttackSpeed(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._highAttackSpeed = level;
        GameData.setUserData({ highAttackSpeed: GameData._highAttackSpeed });
    }

    // 获取高级攻速等级
    static get highAttackSpeed() {
        return GameData._highAttackSpeed;
    }

    // 设置高级攻击等级
    static set highAttack(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._highAttack = level;
        GameData.setUserData({ highAttack: GameData._highAttack });
    }

    // 获取高级攻击等级
    static get highAttack() {
        return GameData._highAttack;
    }

    //设置高级暴击等级
    static set highCriticalStrike(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._highCriticalStrike = level;
        GameData.setUserData({ highCriticalStrike: GameData._highCriticalStrike });
    }

    // 获取高级暴击等级
    static get highCriticalStrike() {
        return GameData._highCriticalStrike;
    }

    // 设置暴击暴伤等级
    static set forceCriticalStrike(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._forceCriticalStrike = level;
        GameData.setUserData({ forceCriticalStrike: GameData._forceCriticalStrike });
    }

    // 获取暴击暴伤等级
    static get forceCriticalStrike() {
        return GameData._forceCriticalStrike;
    }

    //设置已领取免费领取钻石次数
    static set freeDiamondCount(count) {
        if (count < 0) {
            count = 0;
        }
        GameData._freeDiamondCount = count;
        GameData.setUserData({ freeDiamondCount: GameData._freeDiamondCount });
    }

    //获取已领取免费领取钻石次数
    static get freeDiamondCount() {
        return GameData._freeDiamondCount;
    }

    //设置游戏战斗等级
    static set fightLevel(level) {
        if (level < 0) {
            level = 0;
        }

        GameData._fightLevel = level;
        GameData.setUserData({ fightLevel: GameData._fightLevel })
    }

    //获取游戏战斗等级
    static get fightLevel() {
        return GameData._fightLevel;
    }

    //设置当前关卡敌人血量
    static set enemyHP(HP) {
        if (HP < 0) {
            HP = 0;
        }
        GameData._enemyHP = HP;
        GameData.setUserData({ enemyHP: GameData._enemyHP });

    }

    //获取当前关卡敌人血量
    static get enemyHP() {
        return GameData._enemyHP;
    }

    //设置当前关卡基础血量
    static set baseBonus(baseBonus) {
        if (baseBonus < 0) {
            baseBonus = 0;
        }
        GameData._baseBonus = baseBonus;
        GameData.setUserData({ baseBonus: GameData._baseBonus })
    }

    //获取当前关卡基础奖励
    static get baseBonus() {
        return GameData._baseBonus;
    }

    // 设置宝箱抽奖次数
    static set lotteryTimes(lotteryTimes) {
        if (lotteryTimes < 0) {
            GameData._lotteryTimes = 0;
        }
        GameData._lotteryTimes = lotteryTimes;
        localStorage.setItem("lottery", JSON.stringify({ day: Util.getCurrTimeYYMMDD(), times: GameData._lotteryTimes }))
    }

    // 获取宝箱抽奖次数
    static get lotteryTimes() {
        return GameData._lotteryTimes;
    }

    // 获取回收金币加成
    static getRecycleGoldIncrease() {
        return (GameData._recycleLevel + GameData._highRecycle) * 0.05;
    }

    // 获取飞机攻击力加成
    static getAttackIncrease() {
        return (GameData._attack + GameData._highAttack) * 0.01;
    }

    // 获取飞机设计速度加成
    static getAttackSpeedIncrease() {
        return GameData._highAttackSpeed * 0.01;
    }

    // 获取飞机暴击率加成
    static getCriticalStrikeIncrease() {
        return (GameData._criticalStrike + GameData._highCriticalStrike) * 0.01;
    }

    // 获取飞机暴击伤害加成
    static getForceCriticalStrike() {
        return GameData._forceCriticalStrike * 0.02;
    }

    //获取本地所有游戏数据
    static getAllLocalGameData() {
        console.log("获取本地数据！！！！！！！！！！！！");
        GameData.gold = WXCtr.getStorageData("gold");
        GameData.diamonds = WXCtr.getStorageData("diamonds");
        GameData.maxPlaneLevel = WXCtr.getStorageData("maxPlaneLevel", 1);
        GameData.repPlaneNum = WXCtr.getStorageData("repPlaneNum");
        GameData.factoryLevel = WXCtr.getStorageData("factoryLevel");
        GameData.repositoryLevel = WXCtr.getStorageData("repositoryLevel");
        GameData.recycleLevel = WXCtr.getStorageData("recycle");
        GameData.attackLevel = WXCtr.getStorageData("attack");
        GameData.criticalStrikeLevel = WXCtr.getStorageData("criticalStrike");
        GameData.highAttack = WXCtr.getStorageData("highAttack");
        GameData.highAttackSpeed = WXCtr.getStorageData("highAttackSpeed");
        GameData.highRecycleLevel = WXCtr.getStorageData("highRecycle");
        GameData.highCriticalStrike = WXCtr.getStorageData("highCriticalStrike");
        GameData.forceCriticalStrike = WXCtr.getStorageData("forceCriticalStrike");
        GameData.vipLevel = WXCtr.getStorageData("vipLevel");
        GameData.freeDiamondCount = WXCtr.getStorageData("freeDiamondCount");
        GameData.fightLevel = WXCtr.getStorageData("fightLevel", 1);
        GameData.enemyHP = WXCtr.getStorageData("enemyHP", 30);
        GameData.baseBonus = WXCtr.getStorageData("baseBonus", 10);
        Guide.guideStep = WXCtr.getStorageData("guideStep");

        console.log("log----------GameData.baseBonus  local=:",GameData.baseBonus)

        for (let i = 1; i <= this.maxApron; i++) {
            let key = "feiji_" + i;
            let data = WXCtr.getStorageData(key);
            if (data) {
                GameData.planeData[key] = data;
            } else {
                GameData.planeData[key] = 0;
            }
        }
        for (let i = 1; i <= this.maxPlane; i++) {
            let key = "feijiLevel_" + i;
            let data = WXCtr.getStorageData(key, 1);
            if (data) {
                GameData.planeData[key] = data;
            } else {
                GameData.planeData[key] = 1;
            }
        }

        GameData.setUserData(GameData.planeData);
        GameData.getMissionData();
        GameCtr.ins.mGame.gameStart();
    }

    static getOnlineGameData(data) {
        GameData.gold = data.gold;
        GameData.diamonds = data.money == "NaN" ? 0 : data.money;
        GameData.maxPlaneLevel = data.maxfeiji == "undefined" ? 1 : data.maxfeiji;
        GameData.repPlaneNum = data.data_1;
        GameData.factoryLevel = data.data_2;
        GameData.repositoryLevel = data.data_3;
        GameData.recycleLevel = data.data_4;
        GameData.attackLevel = data.data_5;
        GameData.criticalStrikeLevel = data.data_6;
        GameData.highAttack = data.data_7;
        GameData.highAttackSpeed = data.data_8;
        GameData.highRecycleLevel = data.data_9;
        GameData.highCriticalStrike = data.data_10;
        GameData.forceCriticalStrike = data.data_11;
        GameData.vipLevel = data.data_12;
        GameData.freeDiamondCount = data.data_14;
        GameData.fightLevel = data.level;

        GameData.enemyHP = data.data_16;
        GameData.baseBonus = data.data_17;

        console.log("log----------GameData.baseBonus  online=:",GameData.baseBonus)

        Guide.guideStep = data.data_13 == "null" ? 8 : data.data_13;
        GameData.setUserData({ guideStep: Guide.guideStep });
        GameData.setUserData({ lastTime: data.data_21 });

        for (let i = 1; i <= this.maxApron; i++) {
            let key1 = "feiji_" + i;
            GameData.planeData[key1] = data[key1] == "NaN" ? 0 : data[key1];
        }
        for (let i = 1; i <= this.maxPlane; i++) {
            let key = "feijiLevel_" + i;
            GameData.planeData[key] = data[key];
        }
        GameData.setUserData(GameData.planeData);
        GameData.getMissionData();
        HttpCtr.submitUserData({});
        GameCtr.ins.mGame.gameStart();
    }

    static getMissionData() {
        let day = Util.getCurrTimeYYMMDD();
        GameData.missionData = WXCtr.getStorageData("missionData");
        if (!GameData.missionData || !GameData.missionData.day || GameData.missionData.day != day) {
            GameData.missionData = {};
            GameData.missionData.day = day;
            GameData.missionData.videoTimes = 0;
            GameData.missionData.speedTimes = 0;
            GameData.missionData.composeTimes = 0;
            GameData.missionData.boxTimes = 0;
            GameData.missionData.turntableTimes = 0;
            GameData.missionData.fightTimes = 0;
            for (let i = 1; i <= 8; i++) {
                let key = "missionCollected_" + i;
                GameData.missionData[key] = false;
            }
        }
        console.log("log----------getMissionData=:", GameData.missionData);
    }

    static setMissonData(key, value) {
        let day = Util.getCurrTimeYYMMDD();
        GameData.missionData[key] = value;
        GameData.missionData.day = day;
        WXCtr.setStorageData("missionData", GameData.missionData);
    }

    //保存个人信息
    static setUserData(data) {
        data["saveTime"] = new Date().getTime();
        for (let key in data) {
            WXCtr.setStorageData(key, data[key]);
            if (dataKeyConfig[key]) {
                data[dataKeyConfig[key]] = data[key];
            }
        }
        HttpCtr.submitUserData(data);
    }

    //设置金币数量
    static set gold(gold) {
        if (gold < 0) {
            gold = 0;
        }
        GameData._gold = gold;
        GameData.setUserData({ gold: GameData._gold });
    }

    //获取金币数量
    static get gold() {
        return GameData._gold;
    }

    static submitGameData() {
        HttpCtr.submitUserData({
            gold: GameData._gold,
            money: GameData._diamond,
        });
        let city = "未知";
        if (UserManager.user.city) city = UserManager.user.city;
        WXCtr.submitScoreToWx(GameData.fightLevel, city);
    }

    //增加金币
    static addGold(planeLevel) {
        let addGold = Math.floor(25 * Math.pow(2, (planeLevel - 1) * 0.9));
        if (GameCtr.ufoProfitBuff) {
            addGold *= 5;
        }
        GameData.gold += addGold;
    }

    static reduceGold(num) {
        GameData.gold -= num;
    }

    //设置钻石数量
    static set diamonds(diamonds) {
        if (diamonds < 0) {
            diamonds = 0;
        }
        GameData._diamond = diamonds;
        GameData.setUserData({ diamonds: GameData._diamond });
        HttpCtr.submitUserData({ money: GameData._diamond });
    }

    //获取钻石数量
    static get diamonds() {
        return GameData._diamond;
    }

    //改变钻石数量
    static changeDiamonds(num, callback = null) {
        let diamonds;
        HttpCtr.getUserInfo((data) => {
            diamonds = data.money;
            GameData.diamonds = diamonds + num;
            if (callback) {
                callback();
            }
        });
    }

    //设置自己拥有的最高飞机等级
    static set maxPlaneLevel(level) {
        GameData._maxPlaneLevel = level;
        GameData.setUserData({ maxPlaneLevel: GameData._maxPlaneLevel });
        HttpCtr.submitUserData({
            maxfeiji: GameData._maxPlaneLevel,
        });
    }

    //获取自己拥有的最高飞机等级
    static get maxPlaneLevel() {
        return GameData._maxPlaneLevel;
    }

    //获取飞机价格
    static getPriceOfPlane(level) {
        let price

        return price;
    }

    // 设置工厂等级
    static set factoryLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._factoryLevel = level;
        GameData.setUserData({ factoryLevel: GameData._factoryLevel });
    }

    // 获取工厂等级
    static get factoryLevel() {
        return GameData._factoryLevel;
    }

    // 获取制造时间
    static getProduceTime() {
        return this.baseProduceTime - (0.2 * GameData.factoryLevel);
    }

    // 设置仓库等级
    static set repositoryLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._repositoryLevel = level;
        GameData.setUserData({ repositoryLevel: GameData._repositoryLevel });
    }

    // 获取仓库等级
    static get repositoryLevel() {
        let level = GameData._repositoryLevel;
        return GameData._repositoryLevel;
    }

    // 获取仓库容量
    static getRepositoryCapacity() {
        return GameData.baseRepository + (2 * GameData.repositoryLevel);
    }

    // 设置Vip等级
    static set vipLevel(level) {
        if (level < 0) {
            level = 0;
        }
        GameData._vipLevel = level;
        GameData.setUserData({ vipLevel: GameData._vipLevel });
    }

    // 获取vip等级
    static get vipLevel() {
        return GameData._vipLevel;
    }

    //设置停机坪状态
    static setApronState(idx, level/* -1代表该停机坪未解锁， 0代表该停机坪上没有飞机， 大于0代表停机坪上飞机等级 */) {
        let key = "feiji_" + idx;
        if (GameData.planeData) {
            GameData.planeData[key] = level;
        }
        GameCtr.selfPlanes[idx - 1] = level;
        let data = {};
        data[key] = level;
        GameData.setUserData(data);
        HttpCtr.submitUserData(data);
    }

    //获取停机坪状态
    static getApronState(idx) {
        let level = 0;
        let key = "feiji_" + idx;
        for (let key1 in GameData.planeData) {
            if (key == key1) {
                level = GameData.planeData[key1];
            }
        }
        if (GameData.planeData && GameData.planeData[key] && GameData.planeData[key] != 0) {
            level = GameData.planeData[key];
        }
        return level;
    }

    //设置飞机等级
    static setPlaneLevel(idx, level) {
        let key = "feijiLevel_" + idx;
        if (GameData.planeData) {
            GameData.planeData[key] = level;
        }
        let data = {};
        data[key] = level;
        GameData.setUserData(data);
        HttpCtr.submitUserData(data);
    }

    // 获取飞机等级
    static getPlaneLevel(idx) {
        let level = 1;
        let key = "feijiLevel_" + idx;
        if (GameData.planeData && GameData.planeData[key] && GameData.planeData[key] != 0) {
            level = GameData.planeData[key];
        }
        return level;
    }


    static getPlaneLifeValue(level) {
        for (let i = 0; i < 4; i++) {
            if (level >= (i + 1) * 25) {
                return 2 + i + 1
            }
        }
        return 2;
    }


    static getEnemyHP() {
        if (GameData.fightLevel == 1) {
            GameData.enemyHP = 30;
            return GameData.enemyHP;
        }
        return Math.floor(((3 + GameData.fightLevel) / Math.pow(GameData.fightLevel, 1.8) + 1.02) * GameData.enemyHP) + 9 * (GameData.fightLevel - 1);
    }


    static getBaseBonus() {
        if (GameData.fightLevel == 1) {
            GameData.baseBonus = 10;
            return GameData.baseBonus;
        }
        
        return Math.floor(Math.pow(Math.floor(GameData.fightLevel / 3 + 1), 1.5) + GameData.baseBonus * 1.02);
    }

    // update (dt) {}
}
