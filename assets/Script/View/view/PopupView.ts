/**
 * 基础弹出界面
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupView extends cc.Component {

    private _maskNode: cc.Node = null;//蒙层
    contentNode: cc.Node;

    private _showMask: boolean;//是否显示蒙层
    private _maskOpacity: number = 0;//蒙层不透明度
    private destroyCallback: Function;
    private _closeOnTouchOutside: boolean;//是否点击外面关闭
    private _closeOnKeyBack: boolean;//是否点击返回键关闭
    private _showAction: cc.Action;
    private _showActionTarget: cc.Node;
    private _dismissAction: cc.Action;
    private _dismissActionTarget: cc.Node
    private _localZOrder: number = 0;

    onLoad() {
        this._maskNode = this.node.getChildByName("mask");
        if (this._maskNode) {
            this._maskNode.active = this._showMask;
            this._maskNode.opacity = this._maskOpacity;
            this._maskNode.on(cc.Node.EventType.TOUCH_START, this.onTouchMask, this);
            this._maskNode.on(cc.Node.EventType.TOUCH_END, this.onTouchMask, this);
        }
    }

    onDestroy() {
        if (this._maskNode) {
            this._maskNode.off(cc.Node.EventType.TOUCH_START, this.onTouchMask, this);
            this._maskNode.off(cc.Node.EventType.TOUCH_END, this.onTouchMask, this);
        }
        if (this.destroyCallback) {
            this.destroyCallback(this);
        }
    }

    onTouchMask(event: cc.Event.EventTouch) {
        event.stopPropagation();
        if (event.type == cc.Node.EventType.TOUCH_END
            && this.closeOnTouchOutside
            && this.contentNode
            && !cc.rectContainsPoint(this.contentNode.getBoundingBoxToWorld(), event.getLocation())) {
            this.dismiss();
        }
    }

    show(parent: cc.Node) {
        if (!cc.isValid(this) || !cc.isValid(parent)) {
            return;
        }
        this.node.parent = parent;
        this.node.setLocalZOrder(this.localZOrder || 0);
        if (cc.isValid(this._showActionTarget) && cc.isValid(this._showAction)) {
            this._showActionTarget.stopAllActions();
            this._showActionTarget.runAction(this._showAction);
        }
    }

    dismiss() {
        if (!cc.isValid(this.node)) {
            return;
        }
        if (cc.isValid(this._dismissActionTarget) && cc.isValid(this._dismissAction)) {
            this._dismissActionTarget.stopAllActions();
            this._dismissActionTarget.runAction(this._dismissAction);
        } else {
            this.doDismiss();
        }
    }

    private doDismiss() {
        this.node.destroy();
    }

    setMask(showMask: boolean, maskOpacity) {
        this._showMask = showMask;
        this._maskOpacity = maskOpacity;
    }

    setShowAction(action: cc.FiniteTimeAction, target: cc.Node) {
        if (cc.isValid(target) && cc.isValid(action)) {
            this._showAction = action;
            this._showActionTarget = target;
        }
    }

    setDismissAction(action: cc.FiniteTimeAction, target: cc.Node) {
        if (cc.isValid(target) && cc.isValid(action)) {
            this._dismissAction = cc.sequence(action, cc.callFunc(() => { this.doDismiss(); }));
            this._dismissActionTarget = target;
        }
    }

    setOnDestroyCallback(callback: Function) {
        this.destroyCallback = callback;
    }

    set closeOnTouchOutside(value: boolean) {
        this._closeOnTouchOutside = value;
    }

    get closeOnTouchOutside(): boolean {
        return this._closeOnTouchOutside;
    }

    set closeOnKeyBack(value: boolean) {
        this._closeOnKeyBack = value;
    }

    get closeOnKeyBack(): boolean {
        return this._closeOnKeyBack;
    }

    set localZOrder(localZOrder: number) {
        this._localZOrder = localZOrder;
    }

    get localZOrder() {
        return this._localZOrder;
    }
}
