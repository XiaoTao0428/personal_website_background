let { Server } = require("socket.io");
const Base = require("./models/Base");

/**
 * 获取房间号
 * 服务器查重房间号并对重复的房间号重新分配
 * */
const getRoomId = async (length = 1, socket) => {
    let roomId = Math.floor(Math.random() * 10)
    let oldLength = length
    while (length - 1) {
        length--
        roomId += '' + Math.floor(Math.random() * 10)
    }
    try {
        const databaseRes = await new Base('chat_rooms').all({
            room_id: roomId
        })
        if (databaseRes.length > 0) {
            roomId = await getRoomId(oldLength, socket)
        }
    } catch (e) {
        socket.emit('CREATE_ROOM_ERROR', e)
        return
    }
    return roomId.toString()
}

const socket_io = {
    getSocketIo: (server) => {
        const io = new Server(server, {
            cors: {
                credentials: true
            }
        })

        // 将在编写会话的第一个 HTTP 请求（握手）的响应标头之前发出，自定义它们
        io.engine.on('initial_headers', (headers, req) => {
            // headers["test"] = "123"
            // headers["set-cookie"] = "mycookie=456"
        })

        // 将在编写会话的每个 HTTP 请求的响应头之前发出（包括 WebSocket 升级），自定义它们
        io.engine.on('headers', (headers, req) => {
            // headers["test"] = "789"
        })

        // 连接到服务器时触发
        io.on('connection', (socket) => {
            console.log('已连接')

            /**
             * 断开连接时触发
             * */
            socket.on('disconnect', (reason) => {
                console.log('断开连接', reason)
            })

            /**
             * 创建房间时触发
             * */
            socket.on('CREATE_ROOM', async (anotherSocketId, offer, data = {
                type: 'public',  // 私有的 private, 公共的 public
                password: '',
            }) => {
                const roomId = await getRoomId(6, socket)
                if (!roomId) {
                    return
                }
                console.log('创建房间', anotherSocketId, roomId)

                let params = {
                    room_id: roomId,
                    creator: anotherSocketId,
                    householder: anotherSocketId,
                    offer: offer
                }
                // 需要密码权限的房间设置密码
                if (data.type === 'private') {
                    params.type = 'private'
                    params.password = data.password
                }
                new Base('chat_rooms').insert({
                    ...params
                }).then(databaseRes => {
                    socket.join(roomId)
                    socket.emit('CREATE_ROOM_SUCCESS', roomId, offer, '房间创建成功')
                }).catch(e => {
                    socket.emit('CREATE_ROOM_ERROR', e)
                })
            })

            /**
             * 申请加入房间时触发
             * */
            socket.on('APPLY_JOIN_ROOM', async (anotherSocketId, roomId) => {
                console.log('加入房间', anotherSocketId, roomId)
                new Base('chat_rooms').all({
                    room_id: roomId
                }).then(databaseRes => {
                    if (databaseRes.length > 0) {
                        const offer = JSON.parse(databaseRes[0].offer)
                        socket.join(roomId)
                        socket.emit('APPLY_JOIN_ROOM_SUCCESS', roomId, offer, '申请加入房间成功')
                    } else {
                        socket.emit('APPLY_JOIN_ROOM_ERROR', roomId, '未找到指定房间')
                    }
                }).catch(e => {
                    socket.emit('APPLY_JOIN_ROOM_ERROR', roomId, e)
                })
            })

            /**
             * 申请加入房间成功时触发
             * */
            socket.on('APPLY_JOIN_ROOM_SUCCESS', async (anotherSocketId, roomId, answer) => {
                console.log('申请加入房间成功', anotherSocketId, roomId)
                io.to(roomId).emit('JOINED_ROOM', anotherSocketId, roomId, answer, '已加入房间')
            })

            /**
             * 申请离开房间时触发
             * */
            socket.on('APPLY_LEAVE_ROOM', async (anotherSocketId, roomId) => {
                console.log('申请离开房间时触发', anotherSocketId, roomId)
                socket.leave(roomId)
                new Base('chat_rooms').all({
                    room_id: roomId
                }).then(databaseRes => {
                    if (databaseRes.householder === anotherSocketId) {
                        io.to(roomId).emit('CLOSED_ROOM', anotherSocketId, roomId, '房间已关闭')
                    } else {
                        io.to(roomId).emit('LEFT_ROOM', anotherSocketId, roomId, '已离开房间')
                    }
                }).catch(e => {
                    console.error(e)
                })
            })

            /**
             * 离开房间成功时触发
             * */
            socket.on('CHANGE_HOUSEHOLDER', async (anotherSocketId, roomId, offer) => {
                console.log('离开房间成功时触发', anotherSocketId, roomId)
                new Base('chat_rooms').update({
                    room_id: roomId
                }, {
                    householder: anotherSocketId,
                    offer: JSON.stringify(offer)
                }).then(databaseRes => {
                    socket.emit('CHANGE_HOUSEHOLDER_SUCCESS', anotherSocketId, roomId, '房主已切换')
                }).catch(e => {
                    console.error(e)
                })
            })

            /**
             * 交换 ICE 候选人信息
             * */
            socket.on('EXCHANGE_ICE_CANDIDATE', async (anotherSocketId, roomId, candidate) => {
                console.log('ICE 候选人信息', anotherSocketId, roomId)
                io.to(roomId).emit('EXCHANGE_ICE_CANDIDATE', anotherSocketId, roomId, candidate, '交换成功')
            })

            /**
             * 收到消息时触发（暂时未使用）
             * */
            socket.on('message', (anotherSocketId, msg) => {
                socket.join(anotherSocketId)
                console.log('收到消息', anotherSocketId, msg)
                io.to(anotherSocketId).emit('message', socket.id, msg)
            })
        })

        // 连接失败
        io.engine.on("connection_error", (err) => {
            console.log(err.req);      // the request object
            console.log(err.code);     // the error code, for example 1
            console.log(err.message);  // the error message, for example "Session ID unknown"
            console.log(err.context);  // some additional error context
        })
    }
};

module.exports = socket_io;
