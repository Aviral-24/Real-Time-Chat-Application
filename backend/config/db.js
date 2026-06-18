const mysql = require('mysql2');


// Pool create karna better hota hai kyunki ye connections ko reuse karta hai
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',         
    password: '34254367', 
    database: 'chat_app',  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// .promise() use kar rahe hain taaki aage hum async/await use kar sakein
module.exports = pool.promise();