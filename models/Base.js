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
    update (id, params){
        return knex(this.table).where('id', '=', id).update(params);
    }

    // 删除
    delete (id){
        return knex(this.table).where('id', '=', id).del();
    }
}

module.exports = Base;
