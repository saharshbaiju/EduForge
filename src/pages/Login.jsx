import React, { useState } from "react";
import Background from "../components/background/Background";
import { Link, useNavigate } from "react-router-dom";

function Login({ setuser, user }) {

    const navigate = useNavigate();
    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setuser(username);
                navigate("/" , {state :{ message : "Login Successful!!"}})
                console.log("SETTING USER:", username);
                
        
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Server connection failed!!!");
        }
    }

    return (
        <>
            <Background />
            
            <img onClick={() => navigate("/")} className="logo" src="src/assets/forge.png" alt="logo" />

            <div className="login-wrapper">
                <div className="dynamic-scroll-container">
                    <div className="scroll-content">
                        <img src="src/assets/cover1.png" alt="scroll" />
                        <img src="src/assets/cover2.png" alt="scroll" />
                        <img src="src/assets/cover2.png" alt="scroll" />
                        <img src="src/assets/cover1.png" alt="scroll" />

                        {/* infinite scroll */}
                        <img src="src/assets/cover1.png" alt="scroll" />
                        <img src="src/assets/cover2.png" alt="scroll" />
                        <img src="src/assets/cover2.png" alt="scroll" />
                        <img src="src/assets/cover1.png" alt="scroll" />
                    </div>
                </div>

                <div className="login-container">
                    <h1>Welcome.</h1>
                    <p>
                        <Link to="/signup"><b>Create a free account</b></Link> or log in to get started.
                    </p>

                    {/* FIX: use onSubmit */}
                    <form className="login-form" onSubmit={handleLogin}>

                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            className={error.includes("user") ? "input-error" : ""}
                            required
                        />
                        {error.toLowerCase().includes("user") && (
                          <span className="field-error">{error}</span>
                        )}

                        <label htmlFor="login-pass">Password</label>
                        <input
                            type="password"
                            id="login-pass"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setpassword(e.target.value)}
                            className={error.includes("Password") ? "input-error" : ""}
                            required
                        />
                        
                        {error.toLowerCase().includes("Password") && (
                            <span className="field-error">{error}</span>
                        )}

                        {error && 
                        !error.toLowerCase().includes("user") && 
                        !error.toLowerCase().includes("Password") && (
                            <div className="error-container">
                                <p className="error-text">{error}</p>
                            </div>
                        )}

                        <button type="submit">Log In</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login; 