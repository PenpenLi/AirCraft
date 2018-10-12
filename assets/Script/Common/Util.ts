/**
 * 通用工具类
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class Util {

    //根据图片路径设置sprite的spriteFrame
    static loadImg(spr, imgUrl) {
        cc.loader.load({
            url: imgUrl,
            type: 'png'
        }, (err, texture) => {
            spr.spriteFrame = new cc.SpriteFrame(texture);
        });
    }

    /**
     * 返回当前节点下第一个名为name的子节点
     * @param name 节点名
     * @param node 开始查找的根节点
     */
    static findChildByName(name: string, node: cc.Node): cc.Node {
        if (!name || !node || !node.children) {
            return null;
        }
        let result = node.getChildByName(name);
        if (result) {
            return result;
        }
        let children = node.children;
        for (let index = 0; index < children.length; index++) {
            result = Util.findChildByName(name, children[index]);
            if (result) {
                return result;
            }
        }
        return null;
    }

    /**
     * 设置节点文本
     * 
     * @param text 文本
     * @param node 节点
     */
    static setStringToNode(node: cc.Node | cc.Label | cc.EditBox, text: string | number) {
        if (typeof text === "number") {
            text = text + "";
        }
        text = text || "";
        if (node instanceof cc.Node) {
            let label = node.getComponent(cc.Label);
            if (cc.isValid(label)) {
                label.string = text;
                return;
            }
            let editBox = node.getComponent(cc.EditBox);
            if (cc.isValid(editBox)) {
                editBox.string = text;
            }
        } else {
            if (cc.isValid(node)) {
                node.string = text
            }
        }
    }

    //裁剪字符串，超出指定长度之后显示...(每个中文字符长度为2）
    static cutstr(str, len) {
        let str_length = 0;
        let str_len = 0;
        let str_cut = new String();
        str_len = str.length;
        for (var i = 0; i < str_len; i++) {
            let a = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                //中文字符的长度经编码之后大于4 
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length > len) {
                str_cut = str_cut.concat("...");
                return str_cut;
            }
        }
        // //如果给定字符串小于指定长度，则返回源字符串； 
        // if (str_length < len) {
        //     return str;
        // }
        return str;
    }

    //获取年月日,格式为:2017-05-06
    static getCurrTimeYYMMDD() {
        var time: string = "";
        var myDate = new Date();
        var year = myDate.getFullYear();
        var month;
        if ((myDate.getMonth() + 1) < 10) {
            month = "0" + (myDate.getMonth() + 1);
        } else {
            month = myDate.getMonth() + 1;
        }
        var day;
        if (myDate.getDate() < 10) {
            day = "0" + myDate.getDate();
        } else {
            day = myDate.getDate();
        }

        time = year + "-" + month + "-" + day;
        return time;
    }

    static formatNum(value, digit = 9) {
        value = Math.floor(value);
        if (value >= Math.pow(10, digit) && value < Math.pow(10, digit+3)) {
            value = Math.floor(value / 1000);
            value = this.getString(value) + "k";
        }
        else if (value >= Math.pow(10, digit+3) && value < Math.pow(10, digit+6)) {
            value = Math.floor(value / 1000000);
            value = this.getString(value) + "M";
        }
        else if (value >= Math.pow(10, digit+6) && value < Math.pow(10, digit+9)) {
            value = Math.floor(value / 1000000000);
            value = this.getString(value) + "B";
        } else if (value >= Math.pow(10, digit+9)) {
            let valueDigit = this.getDigitOfNum(value);
            let suffix = "E"+(valueDigit-3);
            value = Math.floor(value / Math.pow(10, valueDigit-6));
            value = this.getString(value/ 1000.0);
            value = value + suffix;
            
        }
        else {
            value = this.getString(value);
        }
        return value;
    }

    //获取一个数字的位数
    static getDigitOfNum(num) {
        let digit = 0;
        while(num != 0){
            num = Math.floor(num/10);
            digit++;
        }
        return digit;
    }

    static getString(num) {
        var num = (num || 0).toString(), result = '';
        num = num.split(".");
        let floatStr = null;
        let intStr = num[0];
        if (num.length > 1) {
            floatStr = num[1];
            if (floatStr.length > 3) {
                floatStr.substr(0, 3);
            }
        }
        
        if(parseInt(intStr) > 0){
            while (intStr.length > 3) {
                result = ',' + intStr.slice(-3) + result;
                intStr = intStr.slice(0, intStr.length - 3);
            }
        }else if(parseInt(intStr) < 0){
            intStr = intStr.split("-");
            intStr = intStr[1];
            while (intStr.length > 3) {
                result = ',' + intStr.slice(-3) + result;
                intStr = intStr.slice(0, intStr.length - 3);
            }
            intStr = "-"+intStr;
        }
        if (intStr) { result = intStr + result; }
        if (floatStr) { result = result + "." + floatStr }
        return result;
    }

    private static toFloat(value, fractionDigits = 3) {
        try {
            let f = fractionDigits;
            let ret = f ? (value.toString().replace(new RegExp("([0-9]+\.[0-9]{" + f + "})[0-9]*", "g"), "$1") * 1) : (value * 1);
            return isNaN(ret) ? value : ret.toFixed(fractionDigits);
        } catch (e) {
            return value * 1;// 防止小数位数字越界  
        }
    }

    static getTimeOfHHMMSS(time) {
        time = parseInt(time);
        let result = "";
        let hour: any = Math.floor(time / 3600);
        let min: any = Math.floor((time % 3600) / 60);
        let sec: any = time % 60;
        if(hour < 10) {
            hour = "0"+hour;
        }
        if(min < 10) {
            min = "0"+min;
        }
        if(sec < 10) {
            sec = "0"+sec;
        }
        result = hour+":"+min+":"+sec;
        return result;
        // this.lbCountDown.string = min+":"+sec;
    }

    static debugLog(str) {
        if(CC_DEBUG) {
            console.log(str);
        }
    }
}
    
