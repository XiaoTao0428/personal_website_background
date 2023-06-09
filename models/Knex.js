// 引用配置文件
const config = require('../config');

/**
 * @description knex配置文件, 把配置文件中的信息设置再初始配置中
 */
module.exports = require('knex')({
    client: 'mysql',
    connection: {
        host: config.mysql.host,
        port: config.mysql.port,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.database
    },
    pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 100000,
        idleTimeoutMillis: 100000
    },
    log: {
        warn(message) {
            console.log('[knex warn]', message)
        },
        error(message) {
            console.log('[knex error]', message)
        },
        deprecate(message) {
            console.log('[knex deprecate]', message)
        },
        debug(message) {
            console.log('[knex debug]', message)
        }
    }
});
