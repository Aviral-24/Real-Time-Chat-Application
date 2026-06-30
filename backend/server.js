require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const socketManager = require('./Sockets/socketsManager'); 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});


app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Chat App Backend is running perfectly! 🚀');
});

app.use('/api/auth', authRoutes);

socketManager(io);

const PORT = process.env.PORT || 5000; 

server.listen(PORT, () => {
    console.log(`Server is perfectly running on port ${PORT}`);
});