"use client";

import React, { useState } from "react";
import "./signup.css";
import Header from "@/app/Header/header_enter";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const SignUp: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("❌ Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("✅ User created successfully:", userCredential.user);
            alert("Sign up successful! 🎉");
            router.push("/"); // Chuyển về trang chủ sau khi đăng ký thành công
        } catch (error: any) {
            console.error("❌ Sign up failed:", error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Header /> {/* Giữ nguyên Header, không truyền user/onLogout */}

            <div className="signup-box">
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

                    <label>Confirm Password:</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />

                    <button type="submit" className="signup-btn" disabled={loading}>
                        {loading ? "Signing Up..." : "Sign Up"}
                    </button>

                    {error && <p className="error-message">⚠️ {error}</p>}
                </form>

                <p className="login-text">
                    I have an account? <a href="../Login">Login</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
