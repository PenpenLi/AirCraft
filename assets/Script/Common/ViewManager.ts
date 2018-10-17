/**
 * 弹窗管理
 */

import AudioManager from "./AudioManager";
import PopupView from "../View/view/PopupView";
import PromptDialog from "../View/view/PromptDialog";
import ToastView from "../View/view/ToastView";
import GameCtr from "../Controller/GameCtr";
import AuthPop from "../View/view/AuthPop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ViewManager extends cc.Component {
    private static mViewManager: ViewManager;

    private static LocalZOrder = {
        PromptDialog: 1000,
        Loading: 1001,
        Toast: 1002
    }

    static readonly View = {
        PromptDialog: "PromptDialog",//提示弹窗
        ToastView: "ToastView",//Toast提示
    }

    @property(cc.Prefab)
    popupView: cc.Prefab = null;//基础弹出界面

    @property(cc.Prefab)
    promptDialog: cc.Prefab = null;//提示弹窗

    @property(cc.Prefab)
    ranking: cc.Prefab = null;

    @property(cc.Prefab)
    shareGold: cc.Prefab = null;

    @property(cc.Prefab)
    toastView: cc.Prefab = null;

    @property(cc.Prefab)
    authPop: cc.Prefab = null;

    private popupViewList: Array<PopupView> = new Array<PopupView>();//弹出的窗口列表
    private popupViewMap = {};//弹出窗口集合

    onLoad() {
        ViewManager.mViewManager = this;

        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, (event) => {
            AudioManager.getInstance().stopAll();
        });
    }

    onDestroy() {
    }

    //弹出界面销毁回调
    private onPopupDestroy(popupView: PopupView) {
        this.removeFromMap(popupView);
        this.removeFromArray(popupView);
    }

    private show(popupView: PopupView, parent = null as cc.Node) {
        if (!cc.isValid(popupView)) {
            return;
        }
        if (popupView.closeOnKeyBack) {
            this.popupViewList.push(popupView);
        }
        if (ViewManager.getPopupView(popupView.name) != popupView) {
            ViewManager.dismiss(popupView.name);
        }
        if (popupView.name) {
            this.popupViewMap[popupView.name] = popupView;
        }
        popupView.setOnDestroyCallback(this.onPopupDestroy.bind(this));
        popupView.show(parent || ViewManager.getRoot());
    }

    private removeFromMap(popupView: PopupView) {
        if (!popupView) {
            return;
        }
        if (popupView.name) {
            this.popupViewMap[popupView.name] = null;
        }
    }

    private removeFromArray(popupView: PopupView) {
        if (!popupView) {
            return;
        }
        let position = this.popupViewList.indexOf(popupView);
        if (position >= 0) {
            this.popupViewList.splice(position, 1);
        }
    }

    private static checkValid(): boolean {
        return !!ViewManager.mViewManager;
    }

    /**
     * 
     * 显示弹出界面
     */
    static show({
        node = null as cc.Node,//需要显示的界面
        name = null as string,//界面名称，标识界面的唯一性
        parent = null as cc.Node,//弹出父节点
        localZOrder = 0,//节点局部 Z 轴顺序
        data = {} as any,//传入数据
        closeOnTouchOutside = false,//是否点击外面空白区域关闭界面
        closeOnKeyBack = false,//是否响应返回键关闭界面
        mask = true,//是否有蒙层覆盖
        maskOpacity = 255,//蒙层不透明度
        transitionShow = false,//是否显示打开过渡动画
        transitionDismiss = true,//是否显示关闭过渡动画
        showAction = null as cc.FiniteTimeAction,
        showActionTarget = null as cc.Node,
        dismissAction = null as cc.FiniteTimeAction,
        dismissActionTarget = null as cc.Node
    }): PopupView {
        if (!cc.isValid(node)) {
            return;
        }
        if (!ViewManager.checkValid() || !cc.isValid(ViewManager.mViewManager.popupView)) {
            return;
        }
        let popupView: PopupView = node.getComponent(PopupView);
        if (!popupView) {
            let popupNode = cc.instantiate(ViewManager.mViewManager.popupView);
            popupView = popupNode.getComponent(PopupView);
            popupView.contentNode = node;
            popupView.contentNode.parent = popupView.node;
        } else {
            popupView.contentNode = popupView.contentNode
                || popupView.node.getChildByName("ContentNode")
                || popupView.node;
        }
        ViewManager.showPopup({
            popupView,
            name,
            parent,
            localZOrder,
            closeOnTouchOutside,
            closeOnKeyBack,
            mask,
            maskOpacity,
            transitionShow,
            transitionDismiss,
            showAction,
            showActionTarget,
            dismissAction,
            dismissActionTarget
        });
        return popupView;
    }

    static showPopup({
        popupView = null as PopupView,
        name = null as string,//界面名称，标识界面的唯一性
        parent = null as cc.Node,//弹出父节点
        localZOrder = 0,//节点局部 Z 轴顺序
        closeOnTouchOutside = false,//是否点击外面空白区域关闭界面
        closeOnKeyBack = false,//是否响应返回键关闭界面
        mask = true,//是否有蒙层覆盖
        maskOpacity = 255,//蒙层不透明度
        transitionShow = false,//是否显示打开过渡动画
        transitionDismiss = true,//是否显示关闭过渡动画
        showAction = null as cc.FiniteTimeAction,
        showActionTarget = null as cc.Node,
        dismissAction = null as cc.FiniteTimeAction,
        dismissActionTarget = null as cc.Node
    }) {
        if (!ViewManager.checkValid() || !cc.isValid(popupView)) {
            return;
        }

        //蒙层
        if (closeOnTouchOutside) {
            mask = true;
        }
        popupView.setMask(mask, maskOpacity);

        //打开动画
        showActionTarget = showActionTarget || popupView.contentNode;
        if (transitionShow && cc.isValid(showActionTarget)) {
            showAction = showAction || cc.sequence(
                cc.callFunc(() => { showActionTarget.scale = 0; }),
                cc.scaleTo(0.1, 1, 1).easing(cc.easeOut(3.0))
            );
        }
        popupView.setShowAction(showAction, showActionTarget);

        //关闭动画
        dismissActionTarget = dismissActionTarget || popupView.contentNode;
        if (transitionDismiss) {
            dismissAction = dismissAction || null;
        }
        popupView.setDismissAction(dismissAction, dismissActionTarget);

        popupView.closeOnTouchOutside = closeOnTouchOutside;
        popupView.closeOnKeyBack = closeOnKeyBack;
        popupView.name = name || popupView.name;
        popupView.localZOrder = localZOrder || 0;

        ViewManager.mViewManager.show(popupView, parent);
    }

    private static dismissPopup(popupView: PopupView) {
        if (!popupView) {
            return;
        }
        if (cc.isValid(popupView)) {
            popupView.dismiss();
        }
        if (!ViewManager.checkValid()) {
            return;
        }
        ViewManager.mViewManager.removeFromMap(popupView);
        ViewManager.mViewManager.removeFromArray(popupView);
    }

    static dismiss(name: string) {
        if (!name) {
            return;
        }
        if (!ViewManager.checkValid()) {
            return;
        }
        let popupView = ViewManager.mViewManager.popupViewMap[name];
        if (cc.isValid(popupView)) {
            popupView.dismiss();
        }
        ViewManager.mViewManager.popupViewMap[name] = null;
        ViewManager.mViewManager.removeFromMap(popupView);
        ViewManager.mViewManager.removeFromArray(popupView);
    }

    static isShow(name: string): boolean {
        if (!name) {
            return false;
        }
        if (!ViewManager.checkValid()) {
            return false;
        }
        return cc.isValid(ViewManager.mViewManager.popupViewMap[name]);
    }

    /**
     * 获取当前正在显示的弹出界面
     * 
     * @param name 弹出界面名称
     */
    public static getPopupView(name: string) {
        if (!name) {
            return null;
        }
        if (!ViewManager.checkValid()) {
            return null;
        }
        if (cc.isValid(ViewManager.mViewManager.popupViewMap[name])) {
            return ViewManager.mViewManager.popupViewMap[name];
        } else if (ViewManager.mViewManager.popupViewMap[name]) {
            ViewManager.mViewManager.popupViewMap[name] = null;
        }
        return null;
    }

    /**
     * 显示通用提示弹窗
     * 
     * @param data 
     */
    static showPromptDialog(data: {
        node?: cc.Node,
        name?: string,
        title?: string,             //标题  
        closeButton?: boolean,      //是否只显示关闭文字按钮
        transition: boolean   //
    }) {
        if (!ViewManager.checkValid()) {
            return;
        }
        let prompt = cc.instantiate(ViewManager.mViewManager.promptDialog);
        let promptDialog = prompt.getComponent(PromptDialog);
        promptDialog.setData(data);
        ViewManager.show({
            node: prompt,
            name: data.name || ViewManager.View.PromptDialog,
            localZOrder: ViewManager.LocalZOrder.PromptDialog,
            mask: true,
            maskOpacity: 200,
            transitionShow: data.transition
        });
    }

    /**
     * 显示文字提示
     */
    static toast(message: string, textColor: cc.Color = cc.color(255,255,255), showTime = 1.5, fontSize = 0) {
        if (!ViewManager.checkValid()) {
            return;
        }
        let old = ViewManager.getPopupView(ViewManager.View.ToastView);
        let toast;
        let toastView: ToastView
        if (old instanceof ToastView) {
            toast = old.node;
            toastView = old;
        } else {
            toast = cc.instantiate(ViewManager.mViewManager.toastView);
            toastView = toast.getComponent(ToastView);
        }
        toastView.setMessage(message);
        toastView.setFontSize(fontSize);
        toastView.setTextColor(textColor);
        toastView.setShowTime(showTime);
        ViewManager.show({
            node: toast,
            name: ViewManager.View.ToastView,
            localZOrder: ViewManager.LocalZOrder.Toast,
            mask: false,
            transitionDismiss: false
        });
    }

    /**
     * 显示分享得金币弹窗
     */
    static showShareGold() {
        if(GameCtr.shareGoldTimes <= 0) {
            return;
        }
        if(ViewManager.mViewManager.popupViewMap["shareGold"]) return;
        let nd = cc.instantiate(ViewManager.mViewManager.shareGold);
        ViewManager.showPromptDialog({
            node: nd,
            name: "shareGold",
            title: "分享立得",
            closeButton: true,
            transition: false
        });
    }

    /**
     * 显示排行榜
     */
    static showRanking() {
        let nd = cc.instantiate(ViewManager.mViewManager.ranking);
        ViewManager.showPromptDialog({
            node: nd,
            closeButton: true,
            transition: false,
        });
    }

    static showAuthPop() {
        let nd = cc.instantiate(ViewManager.mViewManager.authPop);
        // let comp = nd.getComponent(AuthPop);
        // comp.setData({node: nd});
        ViewManager.show({
            node: nd,
            name: "authPop",
            localZOrder: ViewManager.LocalZOrder.PromptDialog,
            mask: true,
            maskOpacity: 200,
        });
    }

    static getRoot() {
        return cc.director.getScene().getChildByName("Canvas");
    }

    /**
     * 返回当前节点下第一个名为name的子节点
     * @param name 节点名
     * @param node 开始查找的根节点
     */
    static findChildByName(name: string, node: cc.Node): cc.Node {
        if (!name || !node || !node.children) {
            return null;
        }
        let result = node.getChildByName(name);
        if (result) {
            return result;
        }
        let children = node.children;
        for (let index = 0; index < children.length; index++) {
            result = ViewManager.findChildByName(name, children[index]);
            if (result) {
                return result;
            }
        }
        return null;
    }

    

}
