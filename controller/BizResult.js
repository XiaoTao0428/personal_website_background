const BizResultCode = require('./BaseResultCode');

/**
 * @description 统一返回结果
 */
class BizResult {

    /**
     * 返回code
     */
    code;
    /**
     * 返回消息
     */
    message;
    /**
     * 返回数据
     */
    data;
    /**
     * 返回时间
     */
    time;

    /**
     *
     * @param code {number} 返回code
     * @param message {string} 返回消息
     * @param data {any} 返回具体对象
     */
    constructor(code, message, data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.time = Date.now();
    }

    /**
     * 成功
     * @param code {number}
     * @param data {any} 返回对象
     * @param message {string}
     * @return {BizResult}
     */
    static success({ code = BizResultCode.SUCCESS.code, data = {}, message = BizResultCode.SUCCESS.desc }) {
        return new BizResult(code, message, data);
    }

    /**
     * 失败
     * @param code {number}
     * @param errData {any} 返回对象
     * @param message {string}
     * @return {BizResult}
     */
    static fail({ code = BizResultCode.FAILED.code, errData = {}, message = BizResultCode.FAILED.desc }) {
        return new BizResult(code, message, errData);
    }

    /**
     * 参数校验失败
     * @param code {number}
     * @param param {any} 返回对象
     * @param message {string}
     * @return {BizResult}
     */
    static validateFailed({ code = BizResultCode.VALIDATE_FAILED.code, param = {}, message = BizResultCode.VALIDATE_FAILED.desc }) {
        return new BizResult(code, message, param);
    }

    /**
     * 拦截到的业务异常
     * @param bizException {BizException} 业务异常
     */
    static bizFail(bizException) {
        return new BizResult(bizException.code, bizException.message, null);
    }

}

module.exports = BizResult
