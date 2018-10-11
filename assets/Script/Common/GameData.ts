import GameCtr from "../Controller/GameCtr";
import WXCtr from "../Controller/WXCtr";
import Guide from "../View/game/Guide";
import UserManager from "./UserManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GameData {

    private static _experience: number = 0;                             //经验值
    private static _gold: number = 20000;                               //金币数量
    private static _profit: number = 0;                                 //每秒收益
    private static _level: number = 0;                                  //个人等级
    private static _diamond: number = 0;                                //钻石数量
    private static _maxPlaneLevel: number = 1;                          //个人拥有的飞机最高等级   

    public static saveTime = null;                                      //保存数据时间戳

    public static offLineProfit: number = 0;

    public static planeData = {};
    public static maxPlane = 32;                                        //飞机等级上限
    private static maxApron = 15;

    //获取本地所有游戏数据
    static getAllLocalGameData() {
        WXCtr.getStorageData("exp", (data) => {
            if (data) {
                GameData.experience = data;
            }
        });
        WXCtr.getStorageData("gold", (data) => {
            if (data) {
                GameData.gold = data;
            }
        });
        // WXCtr.getStorageData("profit", (data) => {
        //     if (data) {
        //         GameData.profit = data;
        //     }
        // });
        WXCtr.getStorageData("level", (data) => {
            if (data) {
                GameData.level = data;
            }
        });
        WXCtr.getStorageData("diamonds", (data) => {
            if (data) {
                GameData.diamonds = data;
            }
        });
        WXCtr.getStorageData("maxPlaneLevel", (data) => {
            if (data) {
                GameData.maxPlaneLevel = data;
            }
        });

        WXCtr.getStorageData("guideStep", (resp)=>{
            if(resp) {
                Guide.guideStep = resp;
            }
        });

        for (let i = 1; i <= this.maxPlane; i++) {
            let key = "feiji_shop_" + i;
            WXCtr.getStorageData(key, (data) => {
                if (data) {
                    GameData.planeData[key] = data;
                }else {
                    GameData.planeData[key] = 0;
                }
            });
        }

        for(let i = 1; i <= this.maxApron; i++) {
            let key1 = "feiji_" + i;
            let key2 = "feiji_switch_" + i;
            WXCtr.getStorageData(key1, (data) => {
                if (data) {
                    GameData.planeData[key1] = data;
                } else {
                    GameData.planeData[key1] = 0;
                }
            });
            WXCtr.getStorageData(key2, (data) => {
                if (data) {
                    GameData.planeData[key2] = data;
                } else {
                    GameData.planeData[key2] = false;
                }
                if(i == this.maxApron){
                    GameCtr.submitUserData(GameData.planeData);
                    GameCtr.ins.mGame.gameStart();
                }
            });
        }
    }

    static getOnlineGameData(data) {
        GameData.experience = data.exp;
        GameData.gold = data.gold;
        GameData.level = data.level;
        GameData.diamonds = data.money;
        GameData.maxPlaneLevel = data.maxfeiji == "undefined" ? 1 : data.maxfeiji;
        Guide.guideStep = data.data_1 == "null" ? 8 : data.data_1;
        GameData.setUserData({guideStep: Guide.guideStep});
        GameData.setUserData({lastTime: data.data_4});
        for (let i = 1; i <= this.maxPlane; i++) {
            let key = "feiji_shop_" + i;
            GameData.planeData[key] = data[key];
        }

        for(let i = 1; i <= this.maxApron; i++) {
            let key1 = "feiji_" + i;
            let key2 = "feiji_switch_" + i;
            GameData.planeData[key1] = data[key1] == "NaN" ? 0 : data[key1];
            GameData.planeData[key2] = (data[key2] == "true");
        }
        GameData.setUserData(GameData.planeData);
        GameCtr.submitUserData({});
        GameCtr.ins.mGame.gameStart();
    }

    //保存个人信息
    static setUserData(data) {
        data["saveTime"] = new Date().getTime();
        for (let key in data) {
            WXCtr.setStorageData(key, data[key]);
        }
    }

    //获取下一级所需要的经验值
    static getNextExperience() {
        let nextLevel = GameData.level + 1;
        let nextEx = Math.floor(Math.pow(2, nextLevel) * 0.75 + 5);
        return nextEx;
    }

    //增加经验值
    static addExperience(planeLevel) {
        let addEx = Math.floor(Math.pow(2, planeLevel) * (1.0 / planeLevel));
        GameData.experience += addEx;
    }

    //设置经验值
    static set experience(experience) {
        GameData._experience = experience;
        GameData.setUserData({ exp: GameData._experience });
    }

    //获取经验值
    static get experience() {
        return GameData._experience;
    }

    //设置等级
    static set level(level) {
        GameData._level = level;
        GameData.setUserData({ level: GameData._level });
        GameCtr.submitUserData({ level: GameData._level });
    }

    //获取等级
    static get level() {
        return GameData._level;
    }

    static set profit(profit) {
        GameData._profit = profit;
        GameData.setUserData({ profit: GameData._profit });
    }

    static get profit() {
        return GameData._profit;
    }

    //增加飞机的每秒收益
    static addProfitOfPlane(planeLevel) {
        let profit = GameData.getProfitOfPlane(planeLevel);
        GameData.profit += profit;
    }

    //减少飞机每秒收益
    static reduceProfitOfPlane(planeLevel) {
        let profit = GameData.getProfitOfPlane(planeLevel);
        GameData.profit -= profit;
        if (GameData.profit <= 0) {
            GameData.profit = 0;
        }
    }

    //获取飞机的每秒收益
    static getProfitOfPlane(planeLevel) {
        let speed = GameData.getSpeedOfPlane(planeLevel);
        let profit = Math.floor(25 * Math.pow(2, (planeLevel - 1) * 0.9) / speed);
        return profit;
    }

    //获取飞机的基础收益
    static getBaseProfitOfPlane(level) {
        let profit = Math.floor(25 * Math.pow(2, (level - 1) * 0.9));
        return profit;
    }

    //设置金币数量
    static set gold(gold) {
        if(gold < 0){
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
        GameCtr.submitUserData({
            gold: GameData._gold,
            profit: GameData._profit,
            money: GameData._diamond,
            level: GameData._level,
            exp: GameData._experience
        });
        let city = "未知";
        if(UserManager.user.city) city = UserManager.user.city;
        WXCtr.submitScoreToWx(GameData._gold, city);
    }

    //增加金币
    static addGold(planeLevel) {
        let addGold = Math.floor(25 * Math.pow(2, (planeLevel - 1) * 0.9));
        if(GameCtr.ufoProfitBuff){
            addGold *= 5;
        }
        GameData.gold += addGold;
    }

    static reduceGold(num) {
        GameData.gold -= num;
    }

    //设置钻石数量
    static set diamonds(diamonds) {
        if(diamonds < 0) {
            diamonds = 0;
        }
        GameData._diamond = diamonds;
        GameData.setUserData({ diamonds: GameData._diamond });
        GameCtr.submitUserData({money: GameData._diamond});
    }

    //获取钻石数量
    static get diamonds() {
        return GameData._diamond;
    }

    //改变钻石数量
    static changeDiamonds(num, callback = null) {
        let diamonds;
        GameCtr.getUserInfo((data) => {
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
        GameCtr.submitUserData({
            maxfeiji:  GameData._maxPlaneLevel,
        });
    }

    //获取自己拥有的最高飞机等级
    static get maxPlaneLevel() {
        return GameData._maxPlaneLevel;
    }

    //获取飞机价格
    static getPriceOfPlane(level, times) {
        let price
        if (level == 1) {
            price = Math.floor(100 * Math.pow(1.25, times));
        } else {
            let profit = GameData.getProfitOfPlane(level - 1);
            price = Math.floor(Math.floor((profit * 360 * (Math.pow(1.5, (level - 1)))) / 10) * 10 * Math.pow(1.25, times));
        }
        return price;
    }

    //获取飞机速度
    static getSpeedOfPlane(level) {
        let speed = 5 * (1 - Math.pow(0.001, (1 / level)));
        return speed;
    }

    //获取飞机的购买次数
    static getBuyTimesOfPlane(level) {
        let times = 0;
        let key = "feiji_shop_" + level;
        if (GameData.planeData && GameData.planeData[key]) {
            times = GameData.planeData[key];
        }
        return times;
    }

    //设置飞机的购买次数
    static setBuyTimesOfPlane(level, times) {
        let key = "feiji_shop_" + level;
        if (GameData.planeData) {
            GameData.planeData[key] = times;
        }
        let data = {};
        data[key] = times;
        GameData.setUserData(data);
        GameCtr.submitUserData(data);
    }

    //设置停机坪状态
    static setApronState(idx, level/* -1代表该停机坪未解锁， 0代表该停机坪上没有飞机， 大于0代表停机坪上飞机等级 */) {
        let key = "feiji_" + idx;
        if (GameData.planeData) {
            GameData.planeData[key] = level;
        }
        let data = {};
        data[key] = level;
        GameData.setUserData(data);
        GameCtr.submitUserData(data);
    }

    //获取停机坪状态
    static getApronState(idx) {
        let level = 0;
        let key = "feiji_" + idx;
        for(let key1 in GameData.planeData){
            if(key == key1){
                level = GameData.planeData[key1]; 
            }
        }
        if (GameData.planeData && GameData.planeData[key] && GameData.planeData[key] != 0) {
            level = GameData.planeData[key];
        }
        return level;
    }

    // 设置停机坪飞机状态（是否在跑道）
    static setPlaneStateOfApron(idx, state = false) {
        let key = "feiji_switch_" + idx;
        if (GameData.planeData) {
            GameData.planeData[key] = state;
        }
        let data = {};
        data[key] = state;
        GameData.setUserData(data);
        GameCtr.submitUserData(data);
    }

    //获取停机坪飞机状态
    static getPlaneStateOfApron(idx) {
        let state = false;
        let key = "feiji_switch_" + idx;
        if (GameData.planeData && GameData.planeData[key]) {
            state = GameData.planeData[key];
        }
        return state;
    }

    // update (dt) {}
}
