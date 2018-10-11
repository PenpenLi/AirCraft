import RankingCell from "./RankingCell";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Ranking extends cc.Component {

    @property(cc.Node)
    ndContent: cc.Node = null;
    @property(cc.Prefab)
    pfCell: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    private pageSize = 5;
    private lastPage = 1;

    loadRanking(data, page) {
        let pageCount = Math.ceil(data.length / this.pageSize);
        if(page > pageCount) {
            page = this.lastPage;
        }
        for (let i = this.pageSize*(page-1); i < page * this.pageSize; i++) {
            let info = data[i];
            if (info && info.KVDataList.length > 0) {
                let cell = cc.instantiate(this.pfCell);
                this.ndContent.addChild(cell);
                let comp = cell.getComponent(RankingCell);
                comp.setData(i, info);
            }
        }
        this.lastPage = page;
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
