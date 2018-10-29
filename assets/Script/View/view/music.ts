import GameCtr from "../../Controller/GameCtr";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    updatePlayState(){
        console.log('log-----------updatePlayState GameCtr.musicSwitch=:',GameCtr.musicSwitch);
        let audioSource=this.node.getComponent(cc.AudioSource);
        if(GameCtr.musicSwitch>0){
            audioSource.play();
        }else{
            audioSource.pause();
        }
    }
}
