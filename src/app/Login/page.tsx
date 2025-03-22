"use client";

import React, { useState } from "react";
import "./login.css";
import Header from "@/app/HeaderEnter/header_enter";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation"; 

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "/HomePage";  // Chuyển về trang chính sau khi đăng nhập
            
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <Header /> {/* Giữ nguyên Header, không truyền user/onLogout */}
            <div className="login-box">
                <form onSubmit={handleSubmit}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />

                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {error && <p className="error-message">⚠️ {error}</p>}
                </form>

                <p className="signup-text">
                    I don't have an account? <a href="../SignUp">Sign Up</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
