/**
 * 对象缓冲池
 */
export default class NodePoolManager {
    private nodePool: cc.NodePool;//对象池
    private node: cc.Node | cc.Prefab;//对象实例
    private destroyed = false;

    private constructor(node: cc.Node | cc.Prefab, poolHandlerComp?: { prototype: cc.Component } | string) {
        this.nodePool = new cc.NodePool(poolHandlerComp);
        this.node = node;
    }

    get(): cc.Node {
        let newNode: cc.Node;
        if (this.nodePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            newNode = this.nodePool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            if (this.node instanceof cc.Prefab) {
                newNode = cc.instantiate(this.node);
            } else {
                newNode = cc.instantiate(this.node);
            }
        }
        return newNode;
    }

    put(node: cc.Node) {
        if (this.destroyed) {
            return;
        }
        this.nodePool.put(node); // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
    }

    destroy() {
        this.destroyed = true;
        this.nodePool.clear();
    }

    static create(node: cc.Node | cc.Prefab, poolHandlerComp?: { prototype: cc.Component } | string): NodePoolManager {
        return new NodePoolManager(node, poolHandlerComp);
    }
}
