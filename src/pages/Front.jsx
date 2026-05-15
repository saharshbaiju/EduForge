import React, { useState, useEffect } from "react";
import Background from "../components/background/Background";
import { Link, useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";


function Front({user,input, setinput}) {
    console.log(user+"hello");
    const location = useLocation();
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if(!user){
            navigate("/login")
            return;
        }
        if (input.trim()){
            console.log("Redirecting to home...");
            navigate(`/home?query=${encodeURIComponent(input.trim())}`)
        }
    };
    useEffect(() => {
        if (location.state?.message) {
            setToastMsg(location.state.message);
            setShowToast(true);

            const time = setTimeout(() => {
                setShowToast(false);
            }, 1000);

            return () => clearTimeout(time); // 
        }
    }, [location]);


    return (
        <>
            {showToast && (
                <div className="toast-notification">
                    <div className="toast-header">
                        <span className="info-icon">i</span>
                        <span className="toast-title">Notice</span>
                    </div>
                    <p className="toast-body">{toastMsg}</p>
                </div>
            )}

            <div className="front-container">
                <img src="src/assets/forge.png" alt="logo" className="logo" />
                <h1 className="eduforge-heading">EduForge</h1>
                <h5 className="caption">Where knowledge is forged, not scrolled.</h5>

                <form onSubmit={handleSearch}>
                    <div className="wrapper-front">
                        <input
                            type="search"
                            value={input}
                            onChange={(e) => setinput(e.target.value)}
                            placeholder="Search skills ..."
                            className="search"
                        />
                        <button type="submit" className="search-button">
                            <img src="src/assets/search.svg" alt="search" className="search-button"/>
                        </button>
                    </div>
                </form>
            </div>
            {
                !user && (
                <>
                <Link to="/login">
                <button className="login-signup">login/sign-up</button>
                </Link>
                </>
                )
            }
            {
                user && (
                    <>
                    <Link to="/profile">
                    <img className="profile-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4hXH0vSYIzlKSEVCV67X88kiAcYjH7S9FXQ&s" alt="profile image" />
                    </Link>
                    </>
                )
            }
            

            <Hero />
            <Background />
        </>
    );
}

export default Front;