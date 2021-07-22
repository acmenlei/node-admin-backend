const TOKEN = 'token'
const RedisClient = require("../../connect/redis")
const { VerifyToken } = require('../../authentication/token')

// 验证token是否合格
function TOKEN_VERIFY(token, username) {
    return new Promise((resolve, reject) => {
        try {
            RedisClient.get(`${username}:${TOKEN}`, async (err, reply) => {
                if (reply == null) { // 当从redis查询的token为null
                    reject({ msg: err }) // 那么他就是非法操作
                } else {
                    if (token === reply) { // 传进来的和当前的token一致
                        try {
                            await VerifyToken(token) // 继续验证，验证通过 code=200
                            resolve(true)
                        } catch (e) {
                            reject(e)
                        }
                    }
                    reject({ msg: "错误的token" }) // 否则验证不通过
                }
            })
        } catch (error) {
            resolve(true) // 出错也抛出一个true
        }
    })

}

/* token令牌设置操作 */
function SET_TOKEN(resp, hash, username) {
    resp.setHeader(TOKEN, hash) // 设置token
    RedisClient.SETEX(`${username}:${TOKEN}`, 60 * 60 * 24, hash) // 设置有效时间为24小时
}

module.exports = {
    TOKEN_VERIFY,
    SET_TOKEN,
    TOKEN
}