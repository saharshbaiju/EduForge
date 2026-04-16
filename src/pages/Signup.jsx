import React from "react";
import Background from "../components/background/Background";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Signup(){
    const navigate = useNavigate();

    const handleSignUp = () =>{
        navigate("/login")
    }

    return(
        <>
        
        <Background/>
                    <img className="logo" src="src/assets/forge.png" alt="logo" />

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
                    <label for="username">Username</label>
                    <input type="text" id="username " placeholder="Enter username"/>
                    
                    <label for="signup-pass">Password</label>
                    <input type="password" id="signup-pass" placeholder="Password"/>    
                    
                    <label for="signup-confirm-pass">Confirm Password</label>
                    <input type="password" id="signup-confirm-pass" placeholder="Confirm Password"/>
                    <button type="button" onClick={handleSignUp}>Sign up</button>
                </form>
                
            </div>
            
        </div>
            
        </>
    
        
)
}
export default Signup;
        