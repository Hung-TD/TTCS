"use client";

import React, { useState } from "react";
import "./signup.css";
import Header from "@/components/HeaderEnter/header_enter";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/services/authService";

const SignUp: React.FC = () => {
    const [username, setUsername] = useState("");
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
            await signUpWithEmail(username, email, password);
            alert("Sign up successful! 🎉");
            router.push("/");
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Header />

            <div className="signup-box">
                <form onSubmit={handleSubmit}>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

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
