
const {ccclass, property} = cc._decorator;

@ccclass
export default class RankingCell extends cc.Component {

    @property(cc.Sprite)
    sprBg: cc.Sprite = null;
    @property(cc.Sprite)
    sprMedal: cc.Sprite = null;
    @property(cc.Sprite)
    sprHead: cc.Sprite = null;
    @property(cc.Label)
    lbRank: cc.Label = null;
    @property(cc.Label)
    lbName: cc.Label = null;
    @property(cc.Label)
    lbLocation: cc.Label = null;
    @property(cc.Label)
    lbScore: cc.Label = null;
    @property([cc.SpriteFrame])
    medalFrames: cc.SpriteFrame[] = [];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    setData(rank, data) {
        console.log("rankingCell data == ", data);
        this.createImage(data.avatarUrl);
        this.lbName.string = this.cutstr(data.nickname, 10);
        this.setMedal(rank);
        if(!data.KVDataList) {
            return;
        }
        let score = data.KVDataList.length != 0 ? data.KVDataList[1].value : 0;
        score = parseInt(score)
        this.lbScore.string = this.formatNum(score);
        // let location = data.KVDataList.length > 1 ? data.KVDataList[0].value : "未知";
        // this.lbLocation.string = location;
    }

    
    setMedal(idx) {
        if(idx < 3) {
            this.sprMedal.node.active = true;
            this.sprMedal.spriteFrame = this.medalFrames[idx];
            this.lbRank.node.active = false;
        }else{
            this.lbRank.node.active = true;
            this.lbRank.string = idx+1;
            this.sprMedal.node.active = false;
        }
    }

    createImage(avatarUrl) {
        if (window.wx != undefined) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.sprHead.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                        this.sprHead.node.active = false;
                    }
                };
                image.src = avatarUrl;
            } catch (e) {
                cc.log(e);
                this.sprHead.node.active = false;
            }
        } else {
            cc.loader.load({
                url: avatarUrl,
                type: 'jpg'
            }, (err, texture) => {
                this.sprHead.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }

    //裁剪字符串，超出指定长度之后显示...(每个中文字符长度为2）
    cutstr(str, len) {
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

    formatNum(value, digit = 6) {
        value = Math.floor(value);
        if (value >= Math.pow(10, digit) && value < Math.pow(10, digit + 3)) {
            value = Math.floor(value / 1000);
            value = this.getString(value) + "k";
        }
        else if (value >= Math.pow(10, digit + 3) && value < Math.pow(10, digit + 6)) {
            value = Math.floor(value / 1000000);
            value = this.getString(value) + "M";
        }
        else if (value >= Math.pow(10, digit + 6)) {
            value = Math.floor(value / 1000000000);
            value = this.getString(value) + "B";
        } else if (value >= Math.pow(10, digit + 9)) {
            value = Math.floor(value / 1000000000000);
            value = this.getString(value) + "AA";
        }
        else {
            value = this.getString(value);
        }
        return value;
    }

    getString(num) {
        var num = (num || 0).toString(), result = '';
        let intStr = num;

        while (intStr.length > 3) {
            result = ',' + intStr.slice(-3) + result;
            intStr = intStr.slice(0, intStr.length - 3);
        }
        if (intStr) { result = intStr + result; }
        return result;
    }

    // start () {

    // }

    // update (dt) {}
}
