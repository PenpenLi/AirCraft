
/**
 * 用户管理
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class UserManager {
    private static _user = null;//用户信息
    private static _user_id = null;
    private static _voucher = null;
    /**
     * 设置用户信息
     */
    static set user(user) {
        UserManager._user = user;
    }

    /**
     * 获取用户信息
     */
    static get user() {
        return UserManager._user;
    }

    //获取用户userid
    static get user_id() {
        if (UserManager._user_id != null) {
            return UserManager._user_id;
        }
        return null;
    }

    static set user_id(user_id) {
        UserManager._user_id = user_id;
    }

    static set voucher(voucher) {
        UserManager._voucher = voucher;
    }

    static get voucher() {
        return UserManager._voucher;
    }
    
}
