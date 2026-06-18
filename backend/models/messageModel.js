const db = require('../config/db');

class Message {
    static async saveMessage(senderId, receiverId, message) {
        const [result] = await db.execute(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [senderId, receiverId, message]
        );
        return result;
    }

    static async deleteMessage(messageId) {
        const [result] = await db.execute(
            'DELETE FROM messages WHERE id = ?',
            [messageId]
        );
        return result;

    }
}

module.exports = Message;