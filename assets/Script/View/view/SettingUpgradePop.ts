import ListView, { AbsAdapter } from "./ListView";
import SettingUpgradeItem from "./SettingUpgradeItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SettingUpgradePop extends cc.Component {

    @property(ListView)
    mListView: ListView = null;

    private adapter: ListAdapter;


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        let data: number[] = [1,2,3,4,5,6,7,8,9,10];
        this.adapter = new ListAdapter();
        this.adapter.setDataSet(data);
        this.mListView.setAdapter(this.adapter);
    }

    // update (dt) {}
}

class ListAdapter extends AbsAdapter<SettingUpgradeItem> {
    constructor() {
        super(SettingUpgradeItem);
    }
    updateView(comp: SettingUpgradeItem, data: any) {
        // comp.setData(this.getItem(data));
    }
}
