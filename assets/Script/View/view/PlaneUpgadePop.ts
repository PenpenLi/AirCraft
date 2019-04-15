import ListView, { AbsAdapter } from "./ListView";
import PlaneUpgradeItem from "./PlaneUpgradeItem";
import GameData from "../../Common/GameData";
import PopupView from "./PopupView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlaneUpgadePop extends cc.Component {

    @property(ListView)
    mListView: ListView = null;

    private adapter: ListAdapter;

    // onLoad () {}

    start() {
        let data: any[] = [];
        for(let i = 1; i <= GameData.maxPlane; i++) {
            let level = GameData.getPlaneLevel(i);
            let info = {idx: i, level: level}
            data.push(info);
        }
        this.adapter = new ListAdapter();
        this.adapter.setDataSet(data);
        this.mListView.setAdapter(this.adapter);
    }

    close() {
        if (!this.node.parent) {
            return;
        }
        let popupView = this.node.parent.getComponent(PopupView);
        if (!!popupView) {
            popupView.dismiss();
        } else {
            this.node.destroy();
        }
    }
    // update (dt) {}
}

class ListAdapter extends AbsAdapter<PlaneUpgradeItem> {
    constructor() {
        super(PlaneUpgradeItem);
    }
    updateView(comp: PlaneUpgradeItem, data: any) {
        comp.setData(this.getItem(data));
    }
}
