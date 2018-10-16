import ListView, { AbsAdapter } from "./ListView";
import PlaneUpgradeItem from "./PlaneUpgradeItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlaneUpgadePop extends cc.Component {

    @property(ListView)
    mListView: ListView = null;

    private adapter: ListAdapter;

    // onLoad () {}

    start() {
        const data: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
        this.adapter = new ListAdapter();
        this.adapter.setDataSet(data);
        this.mListView.setAdapter(this.adapter);
    }

    setData(data) {
        
    }

    // update (dt) {}
}

class ListAdapter extends AbsAdapter<PlaneUpgradeItem> {
    constructor() {
        super(PlaneUpgradeItem);
    }
    updateView(comp: PlaneUpgradeItem, posIndex: number) {
        comp.setData(this.getItem(posIndex));
    }
}
