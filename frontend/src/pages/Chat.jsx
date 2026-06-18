import { useState, useEffect, useContext, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [receiverId, setReceiverId] = useState('');
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editText, setEditText] = useState('');

    const socketRef = useRef(null); 

    useEffect(() => {
        if (!user) return;

        socketRef.current = io('https://real-time-chat-application-i39j.onrender.com');
        socketRef.current.emit('user_connected', user.id);

        socketRef.current.on('receive_private_message', (data) => {
            setChatHistory((prev) => [...prev, data]);
        });

        socketRef.current.on('message_saved_success', (data) => {
            setChatHistory((prev) => [...prev, data]);
        });

        socketRef.current.on('message_edited', (data) => {
            setChatHistory((prev) => 
                prev.map(msg => msg.id === data.messageId ? { ...msg, message: data.newText, isEdited: true } : msg)
            );
        });

        socketRef.current.on('message_deleted', (data) => {
            setChatHistory((prev) => prev.filter(msg => msg.id !== data.messageId));
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [user]);


    const sendMessage = (e) => {
        e.preventDefault();
        if (!message || !receiverId) return;

        const msgData = {
            senderId: user.id,
            senderName: user.username,
            receiverId: parseInt(receiverId),
            message: message
        };

        socketRef.current.emit('send_private_message', msgData);
        setMessage(''); 
    };

    // B. Message Edit karke Save Karna
    const saveEditMessage = (msgId) => {
        if (!editText.trim()) return setEditingMsgId(null);

        socketRef.current.emit('edit_message', {
            messageId: msgId,
            newText: editText,
            receiverId: parseInt(receiverId)
        });

        setChatHistory((prev) => 
            prev.map(msg => msg.id === msgId ? { ...msg, message: editText, isEdited: true } : msg)
        );
        
        setEditingMsgId(null);
        setEditText('');
    };

    const handleDeleteMessage = (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        socketRef.current.emit('delete_message', {
            messageId: msgId,
            receiverId: parseInt(receiverId)
        });

        setChatHistory((prev) => prev.filter(msg => msg.id !== msgId));
    };



    if (!user) return <Navigate to="/" />;

    return (
        <div className="flex h-screen bg-gray-50">
            <div className="w-1/4 bg-white border-r p-6 flex flex-col shadow-sm">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Profile</h2>
                    <p className="text-gray-600 mt-2">Logged in as: <span className="font-semibold text-blue-600 capitalize">{user.username}</span></p>
                    <p className="text-gray-500 text-sm">Your ID: {user.id}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Start Chat</h3>
                    <input 
                        type="number" 
                        value={receiverId} 
                        onChange={(e) => setReceiverId(e.target.value)} 
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Friend's User ID (e.g., 2)"
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="bg-white shadow-sm p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">
                        {receiverId ? `Chatting with User ID: ${receiverId}` : "Select a user to chat"}
                    </h2>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-gray-100 flex flex-col space-y-4">
                    {chatHistory.map((chat, index) => (
                        <div key={index} className={`max-w-sm p-3 rounded-lg shadow-sm group ${chat.senderId === user.id ? 'bg-blue-600 text-white self-end rounded-br-none' : 'bg-white text-gray-800 self-start rounded-bl-none border'}`}>
                            
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-xs opacity-75 font-semibold capitalize">
                                    {chat.senderId === user.id ? 'You' : chat.senderName || `User ${chat.senderId}`}
                                </p>
                                
                                {chat.senderId === user.id && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex gap-3">
                                        <button 
                                            onClick={() => { setEditingMsgId(chat.id); setEditText(chat.message); }}
                                            className="text-xs hover:text-gray-200 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteMessage(chat.id)}
                                            className="text-xs text-red-300 hover:text-red-400 hover:underline font-semibold"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {editingMsgId === chat.id ? (
                                <div className="flex gap-2 mt-2">
                                    <input 
                                        type="text" 
                                        value={editText} 
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="text-black text-sm px-2 py-1 rounded w-full outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => saveEditMessage(chat.id)} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                                    <button onClick={() => setEditingMsgId(null)} className="bg-gray-400 text-white text-xs px-2 py-1 rounded">Cancel</button>
                                </div>
                            ) : (
                                <p>
                                    {chat.message} 
                                    {chat.isEdited && <span className="text-[10px] opacity-60 ml-2">(edited)</span>}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
                    <input 
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        placeholder="Type your message..."
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow-md">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;