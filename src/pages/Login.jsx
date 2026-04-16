import React, { useState } from "react";
import Background from "../components/background/Background";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login(){

    const navigate = useNavigate();
    const [username,setusername] = useState("");
    const [password,setpassword] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        
        const res = await fetch("http://127.0.0.1:5000/login",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({username,password}),
        });
        
        const data = await res.json();
        if (res.ok){
            alert("login successful")
            navigate("/home")
        }else{
            alert(data.error)
        }
            
    };

    // const handleLogin = () =>{
    //     navigate("/home")
    // }







    return(
        <>
        
        <Background/>
                    <img className="logo" src="src/assets/forge.png" alt="logo" />

        <div className="login-wrapper">
            <div className="dynamic-scroll-container">
                <div className="scroll-content">
                    <img src="src/assets/cover1.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />
                    <img src="src/assets/cover1.png" alt="scroll image" />

                    {/* for infinite scroll */}

                    <img src="src/assets/cover1.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />
                    <img src="src/assets/cover2.png" alt="scroll image" />
                    <img src="src/assets/cover1.png" alt="scroll image" />

                </div>
            </div>   
            <div className="login-container">
                <h1>Welcome.</h1>
                <p><Link to='/signup'><b>Create a free account</b></Link> or log in to get started.</p>
                <form className="login-form">
                    <label htmlFor="username">Username</label>
                    <input type="text"
                    id="username" 
                    placeholder="Enter username"
                    value={username}
                    onChange={(e)=> setusername(e.target.value)}
                    required
                    />
                    
                    <label htmlFor="login-pass">Password</label>
                    <input type="password"
                    id="login-pass"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=> setpassword(e.target.value)}
                    required
                      />

                    <button type="button" onClick={handleLogin}>Log In</button>

                </form>
                
            </div>
            
        </div>
            
        </>
    
        
)
}
export default Login;