/**
 * 声音管理
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager {
    private static mAudioManager: AudioManager;

    static getInstance() {
        if (AudioManager.mAudioManager == null) {
            AudioManager.mAudioManager = new AudioManager();
        }
        return AudioManager.mAudioManager;
    }

    private musicPath; string = null;//当前正在播放的背景音乐
    private musicId: number = null;//当前正在播放的背景音乐
    private soundId: number = null;//当前正在播放的音效

    private _musicOn: boolean = true;//是否开启播放背景音乐
    private _soundOn: boolean = true;//是否开启播放音效

    private musicVolume = 1;
    private soundVolume = 1;

    private constructor() {

    }

    //播放背景音乐
    async playMusic(path: string, loop: boolean = true) {
        if (!path) {
            return;
        }
        try {
            if (this.musicPath != path) {
                if (this.musicId != null) {
                    cc.audioEngine.stop(this.musicId);
                }
                this.musicId = await this.play(path, loop, this.musicVolume);
            }
            this.musicPath = path;
            if (!this.musicOn) {
                this.pauseMusic();
            }
        } catch (e) {

        }
    }

    private pauseMusic() {
        cc.audioEngine.pause(this.musicId);
    }

    private resumeMusic() {
        cc.audioEngine.resume(this.musicId);
    }

    /**
     * 播放音效
     * 
     * @param path 路径
     * @param loop 是否循环
     * @param resolve 播放成功回调
     * @param reject 播放失败回调
     */
    playSoundAsync(path: string, loop: boolean = false, resolve: (value: Number) => Number, reject: (reason: any) => any) {
        let promiseNumber: Promise<Number> = this.playSound(path, loop);
        if (promiseNumber) {
            if (resolve && reject) {
                promiseNumber.then<Number>(resolve, reject);
                return;
            }
            if (reject) {
                promiseNumber.catch(reject);
            }
        } else {
            if (reject) {
                reject(null);
            }
        }
    }

    //播放很短的音效
    async playSound(path: string, loop: boolean = false) {
        if (!path) {
            return;
        }
        if (!this.soundOn) {
            return;
        }
        try {
            this.soundId = await this.play(path, loop, this.soundVolume);
            return this.soundId;
        } catch (e) {

        }
    }

    /**
     * 停止播放音效
     * 
     * @param audioId 
     */
    stopSound(audioId: number) {
        if (typeof audioId === "number") {
            cc.audioEngine.stop(audioId);
        }
    }

    /**
     * 停止播放所有声音
     */
    stopAll() {
        this.musicPath = null;
        this.musicId = null;
        cc.audioEngine.stopAll();
    }

    private async play(path: string, loop: boolean = false, volume): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            cc.loader.loadRes(path, (err, audio) => {
                if (!err) {
                    let id = cc.audioEngine.play(audio, loop, volume);
                    // cc.log("async play audio %s", audio);
                    resolve(id);
                } else {
                    cc.error(err);
                    reject(err);
                }
            });
        });
    }

    public setMusicVolume(volume) {
        this.musicVolume = volume;
        if(this.musicId >= 0){
            cc.audioEngine.setVolume(this.musicId, volume);
        }
    }

    public setSoundVolume(volume) {
        this.soundVolume = volume;
    }

    public set musicOn(on: boolean) {
        if (this._musicOn == on) {
            return;
        }
        this._musicOn = on;
        if (on) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }
    }

    public get musicOn(): boolean {
        return this._musicOn;
    }

    public set soundOn(on: boolean) {
        this._soundOn = on;
    }

    public get soundOn(): boolean {
        return this._soundOn;
    }
}
