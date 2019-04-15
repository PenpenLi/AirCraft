import RankingCell from "./RankingCell";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Ranking extends cc.Component {

    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Prefab)
    pfCell: cc.Prefab = null;
    @property(cc.Node)
    ndSelf: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    loadRanking(data) {
        for (let i = 0; i < data.length; i++) {
            let info = data[i];
            if (info && info.KVDataList.length > 0) {
                let cell = cc.instantiate(this.pfCell);
                this.ndContent.addChild(cell);
                let comp = cell.getComponent(RankingCell);
                comp.setData(i, info);
            }
        }
    }

    showSelf(data, rank) {
        let comp = this.ndSelf.getComponent(RankingCell);
        comp.setData(rank, data);
    }

    clear() {
        this.ndContent.removeAllChildren();
    }

    onLoad() {
    }

    start() {

    }

    // update (dt) {}
}
