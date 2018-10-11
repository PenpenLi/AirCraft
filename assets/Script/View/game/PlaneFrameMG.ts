

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlaneFrameMG extends cc.Component {

    private static mPlaneFrameMG: PlaneFrameMG;

    @property([cc.SpriteFrame])
    flyFrames: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    landFrames: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    boxFrames: cc.SpriteFrame[] = [];
    
    onLoad() {
        PlaneFrameMG.mPlaneFrameMG = this;
    }

    static setPlaneFrame(sprite, level, planeType = "fly") {
        let arr = PlaneFrameMG.mPlaneFrameMG.flyFrames;
        if(planeType == "land"){
            arr = PlaneFrameMG.mPlaneFrameMG.landFrames;
        }
        if(!arr[level]){
            cc.error("no Frame!!!!");
            return;
        }
        sprite.spriteFrame = arr[level];
    }

    static setBoxFrame(sprite, idx) {
        sprite.spriteFrame = PlaneFrameMG.mPlaneFrameMG.boxFrames[idx];
    }

    // update (dt) {}
}
