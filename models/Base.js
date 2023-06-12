const knex = require('./Knex');

/**
 * @description knex的基础使用
 */
class Base{
    constructor(props) {
        this.table = props
    }

    // 查找
    all (where, who = '*'){
        return knex(this.table).where(where).select(who);
    }

    // 新增
    insert (params){
        return knex(this.table).insert(params);
    }

    // 更改
    update (where, params){
        return knex(this.table).where(where).update(params);
    }

    // 删除
    delete (where){
        return knex(this.table).where(where).del();
    }
}

module.exports = Base;
