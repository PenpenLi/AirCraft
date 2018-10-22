import GameData from "../../Common/GameData";
import GameCtr from "../../Controller/GameCtr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ProduceBtn extends cc.Component {

    @property(cc.Label)
    lbPlanes: cc.Label = null;
    @property(cc.ProgressBar)
    pgbProduce: cc.ProgressBar = null;

    private produceTime;

    setPlaneNum() {
        this.lbPlanes.string = GameData.repPlaneNum + "/" + GameData.getRepositoryCapacity();
    }

    start () {
        this.produceTime = GameData.getProduceTime();
        this.setPlaneNum();
    }

    clickBtn() {
        if(GameData.repPlaneNum > 0) {
            GameData.repPlaneNum--;
            GameCtr.ins.mGame.addPlane();
            this.setPlaneNum();
            if(this.pgbProduce.progress >= 1){
                this.pgbProduce.progress = 0;
            }
        }else{
            this.pgbProduce.progress += 0.2;
        }
    }

    update (dt) {
        if(GameCtr.isSpeedUpModel) {
            this.produceTime = 0.1;
        }
        let num = GameData.repPlaneNum;
        let num1 = GameData.getRepositoryCapacity();
        if(GameData.repPlaneNum < GameData.getRepositoryCapacity()){
            if(this.pgbProduce.progress < 1) {
                let ratio = dt / this.produceTime;
                this.pgbProduce.progress += ratio;
            }else{
                GameData.repPlaneNum++;
                this.setPlaneNum();
                if(GameData.repPlaneNum < GameData.getRepositoryCapacity()){
                    this.pgbProduce.progress = 0;
                }
            }
        }
    }
}
