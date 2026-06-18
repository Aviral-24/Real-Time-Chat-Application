const User = require('../models/userModel'); 

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        await User.create(username, password); 
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed. Username might exist." });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByUsername(username); 
        
        if (user && user.password === password) {
            res.status(200).json({ 
                message: "Login successful", 
                user: { id: user.id, username: user.username } 
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};