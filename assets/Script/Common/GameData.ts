import GameCtr from "../Controller/GameCtr";
import WXCtr from "../Controller/WXCtr";
import Guide from "../View/game/Guide";
import UserManager from "./UserManager";


const { ccclass, property } = cc._decorator;

const dataKeyConfig = {
    money: "data_1",
    diamonds: "data_2",
    fertilizerLevel: "data_3",
    pesticideLevel: "data_4",
    wateringCanLevel: "data_5",
    offLineProfitLevel: "data_6",
    exp: "data_7",
    gameLevel: "data_8",
    guideStep: "data_12",
};

@ccclass
export default class GameData {

    private static _gold: number = 20000;                               //金币数量
    private static _diamond: number = 0;                                //钻石数量
    private static _maxPlaneLevel: number = 1;                          //个人拥有的飞机最高等级   

    public static saveTime = null;                                      //保存数据时间戳

    public static offLineProfit: number = 0;

    public static planeData = {};
    public static maxPlane = 25;                                        //飞机等级上限
    private static maxApron = 15;

    //获取本地所有游戏数据
    static getAllLocalGameData() {
        GameData.gold = WXCtr.getStorageData("gold");
        GameData.diamonds = WXCtr.getStorageData("diamonds");
        GameData.maxPlaneLevel = WXCtr.getStorageData("maxPlaneLevel");
        Guide.guideStep = WXCtr.getStorageData("guideStep");

        for (let i = 1; i <= this.maxApron; i++) {
            let key = "feiji_" + i;
            let data = WXCtr.getStorageData(key);
            if (data) {
                GameData.planeData[key] = data;
            } else {
                GameData.planeData[key] = 0;
            }
        }
        for(let i = 1; i<= this.maxPlane; i++) {
            let key = "feijiLevel_" + i;
            let data = WXCtr.getStorageData(key);
            if (data) {
                GameData.planeData[key] = data;
            } else {
                GameData.planeData[key] = 1;
            }
        }
    }

    static getOnlineGameData(data) {
        GameData.gold = data.gold;
        GameData.diamonds = data.money;
        GameData.maxPlaneLevel = data.maxfeiji == "undefined" ? 1 : data.maxfeiji;
        Guide.guideStep = data.data_1 == "null" ? 8 : data.data_1;
        GameData.setUserData({ guideStep: Guide.guideStep });
        GameData.setUserData({ lastTime: data.data_4 });
        
        for (let i = 1; i <= this.maxApron; i++) {
            let key1 = "feiji_" + i;
            GameData.planeData[key1] = data[key1] == "NaN" ? 0 : data[key1];
        }
        for(let i = 1; i<= this.maxPlane; i++) {
            let key = "feijiLevel_" + i;
            GameData.planeData[key] = data[key];
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
        GameCtr.submitUserData({
            gold: GameData._gold,
            money: GameData._diamond,
        });
        let city = "未知";
        if (UserManager.user.city) city = UserManager.user.city;
        WXCtr.submitScoreToWx(GameData._gold, city);
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
        GameCtr.submitUserData({ money: GameData._diamond });
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
        if(GameData.planeData) {
            GameData.planeData[key] = level;
        }
        let data = {};
        data[key] = level;
        GameData.setUserData(data);
        GameCtr.submitUserData(data);
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

    // update (dt) {}
}
