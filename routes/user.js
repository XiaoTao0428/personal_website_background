const express = require('express');
const router = express.Router();
const Base = require('../models/Base');
const { check, validationResult } = require('express-validator');
const BizResult = require('../controller/BizResult')

/**
 * GET /user/get_userinfo/ listing.
 * 根据用户 id 查指定用户所有信息
 * @param id
 * */
router.get('/user/get_userinfo/', [
  check('id').isLength({ min: 1 }).withMessage('用户名id不能为空'),
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const result = BizResult.validateFailed({
      message: errors.array()[0].msg
    })
    return res.status(result.code).json(result)
  }

  new Base('users').all({
    id: req.query.id
  }).then(databaseRes => {
    const data = databaseRes[0] || {}
    const result = BizResult.success({
      data: data,
      message: '操作成功'
    })
    res.status(result.code).json(result)
  }).catch(e => {
    const result = BizResult.fail({
      errData: e
    })
    res.status(result.code).json(result)
  })
});

/**
 * POST /user/post_user_register/ listing.
 * 新增用户
 *
 * @param username {string}  用户名, min: 1
 * @param nickname {string}  昵称
 * @param phone {number}  手机号
 * @param password {string}  密码, min: 6
 *
 * */
router.post('/user/post_user_register/', [
    check('username').isLength({ min: 1 }).withMessage('用户名不能为空'),
    check('password').isLength({ min: 6 }).withMessage('密码长度不能小于6'),
], (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const result = BizResult.validateFailed({
      message: errors.array()[0].msg
    })
    return res.status(result.code).json(result)
  }

  new Base('users').all({
    username: req.body.username
  }).then(databaseRes => {
    if (databaseRes.length > 0) {
      const result = BizResult.validateFailed({
        message: '此用户名已被占用'
      })
      return res.status(result.code).json(result)
    }
    new Base('users').insert({
      username: req.body.username,
      nickname: req.body.nickname || null,
      phone: req.body.phone || null,
      password: req.body.password,
    }).then(databaseRes => {
      const result = BizResult.success({
        data: req.body,
        message: '添加成功'
      })
      res.status(result.code).json(result)
    }).catch(e => {
      const result = BizResult.fail({
        errData: e
      })
      res.status(result.code).json(result)
    })
  }).catch(e => {
    const result = BizResult.fail({
      errData: e
    })
    res.status(result.code).json(result)
  })
});

module.exports = router;
