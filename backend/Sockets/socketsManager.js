// sockets/socketManager.js
const Message = require('../models/messageModel');

const onlineUsers = {}; 

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`New socket connected: ${socket.id}`);

        socket.on('user_connected', (userId) => {
            onlineUsers[userId] = socket.id;
            console.log(`User ${userId} is online.`);
        });

        socket.on('send_private_message', async (data) => {
            console.log("\n📥 Received data from frontend:", data);
            const { senderId, senderName, receiverId, message } = data;

            try {
                const result = await Message.saveMessage(senderId, receiverId, message);
                const messageId = result.insertId;

                const messagePayload = {
                    id: messageId, 
                    senderId,
                    senderName,
                    message,
                    timestamp: new Date()
                };

                socket.emit('message_saved_success', messagePayload);

                const receiverSocketId = onlineUsers[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_private_message', messagePayload);
                }
            } catch (error) {
                console.error("❌ SEND ERROR:", error.message);
            }
        }); 
        socket.on('edit_message', async (data) => {
            const { messageId, newText, receiverId } = data;

            try {
                await Message.updateMessage(messageId, newText);

                const receiverSocketId = onlineUsers[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message_edited', { messageId, newText });
                }
            } catch (error) {
                console.error("❌ EDIT ERROR:", error.message);
            }
        });

        socket.on('delete_message', async (data) => {
            const { messageId, receiverId } = data;

            try {
                await Message.deleteMessage(messageId);

                const receiverSocketId = onlineUsers[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message_deleted', { messageId });
                }
            } catch (error) {
                console.error("❌ DELETE ERROR:", error.message);
            }
        });

        
        socket.on('disconnect', () => {
            const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
            if (userId) {
                delete onlineUsers[userId];
                console.log(`User ${userId} disconnected.`);
            }
        });
    });
};