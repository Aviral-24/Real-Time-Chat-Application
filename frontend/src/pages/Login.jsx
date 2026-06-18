import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginCall, registerCall } from '../services/api';
import { toast } from 'react-toastify'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegistering) {
             
                await registerCall({ username, password });
                
                toast.success("Registration Successful! Please login now.");
                
                setIsRegistering(false); 
                setPassword(''); 
            } else {
                const data = await loginCall({ username, password });
                setUser(data.user); 
                
                toast.success(`Welcome back, ${data.user.username}! 👋`);
                
                navigate('/chat');  
            }
        } catch (error) {
            console.error(error);
            
            if (isRegistering) {
                toast.error("Registration Failed! Username might already exist. ❌");
            } else {
                toast.error("Login Failed! Please check credentials. ❌");
            }
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    {isRegistering ? "Create Account" : "Chat App Login"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="Username" 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={username} onChange={(e) => setUsername(e.target.value)} required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                    <button type="submit" className={`w-full text-white py-2 rounded-md transition font-semibold ${isRegistering ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {isRegistering ? "Register" : "Login"}
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    <span 
                        className="text-blue-600 font-semibold cursor-pointer hover:underline"
                        onClick={() => setIsRegistering(!isRegistering)}
                    >
                        {isRegistering ? "Login here" : "Register here"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;