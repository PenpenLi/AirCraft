import LandPlane from "./LandPlane";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Apron extends cc.Component {

    public isUsed = false;                                  //是否已经有飞机

    private mPlane: LandPlane = null;

    onLoad () {
    }

    start () {

    }

    set plane(plane) {
        this.mPlane = plane;
    }

    get plane() {
        return this.mPlane;
    }

    reset() {
        this.isUsed = false;
        this.mPlane = null;
    }
    // update (dt) {}
}
