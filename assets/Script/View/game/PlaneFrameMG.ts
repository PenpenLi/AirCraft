

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlaneFrameMG extends cc.Component {

    private static mPlaneFrameMG: PlaneFrameMG;

    @property([cc.SpriteFrame])
    landFrames: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    boxFrames: cc.SpriteFrame[] = [];
    
    onLoad() {
        PlaneFrameMG.mPlaneFrameMG = this;
    }

    static setPlaneFrame(sprite, level) {
        let arr = PlaneFrameMG.mPlaneFrameMG.landFrames;
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
