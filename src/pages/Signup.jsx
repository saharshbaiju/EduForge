import React, { useState } from "react";
import Background from "../components/background/Background";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Signup(){

    const navigate = useNavigate();

    // const handleSignUp = () =>{
    //     navigate("/login")
    // }

    

    const [username,setusername] = useState("");
    const [password,setpassword] = useState("");
    const [repassword,setrepassword] = useState("");
    const [error, setError ] = useState("");

    async function handleSignUp(e) {
        e.preventDefault();
        setError("");

        if (password !== repassword){
            return;
        }
        else{
            
        }
        
        try{
        const res = await fetch(`${API_BASE_URL}/signup`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username,password}),
        });
        
        const data = await res.json();
        if (res.ok){
            navigate("/login", { state: { message: "Account created successfully!" } });
        }else{
            setError(data.error)
        }
    }catch (err){
        setError("Server connection failed!!!");
    }
    };

    const isMatch = password === repassword;
    const isTypingConfirm = repassword.length > 0;
    return(

        <>
                    <img onClick={() => navigate("/")} className="logo" src="src/assets/forge.png" alt="logo" />

        <Background/>
        
        <div className="signup-wrapper">
            <div className="dynamic-scroll-container">
                <div className="scroll-content">
                    <img src="src/assets/cover1.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />


                    {/* for infinite scroll */}

                    <img src="src/assets/cover1.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />
                </div>
            </div>   
            <div className="signup-container">
                <h1>Welcome</h1>
                <p> Already have an account? <Link to='/login' ><b>Login here</b></Link></p>
                <form className="signup-form">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" 
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setusername(e.target.value)}
                    className={error.includes("user") ? "input-error" : ""}
                    required
                    />
                    {error.toLowerCase().includes("user") && (
                        <span className="field-error">{error}</span>
                    )}

                    
                    <label htmlFor="signup-pass">Password</label>
                    <input type="password" 
                    id="signup-pass" 
                    placeholder="Password"
                    value={password}
                    className={password.length > 0 ? "success" : ""}
                    onChange={(e) => setpassword(e.target.value)}
                    required

                    />    
                    
                    <label htmlFor="signup-confirm-pass">Confirm Password</label>
                    <input type="password" 
                    id="signup-confirm-pass" 
                    className={
                        isTypingConfirm
                        ? isMatch
                            ? "input success"
                            : "input error"
                        : "input"
                    }
                    placeholder="Confirm Password"
                    value={repassword}
                    onChange={(e) => setrepassword(e.target.value)}
                    required
                    /> .

                    {error && 
                    !error.toLowerCase().includes("user") && (
                            <div className="error-container">
                                <p className="error-text">{error}</p>
                            </div>

                    )}         
                    <button type="button" onClick={handleSignUp}>Sign up</button>
                </form>
                
            </div>
            
        </div>
            
        </>
    
        
)
}
export default Signup;
        