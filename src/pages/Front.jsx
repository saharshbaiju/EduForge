import React, { useState, useEffect } from "react";
import Background from "../components/background/Background";
import { Link, useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";

function Front({input, setinput}) {
    const location = useLocation();
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (input.trim()){
            navigate(`/home?query=${encodeURIComponent(input)}`)
        }
    };
    useEffect(() => {
        if (location.state?.message) {
            setToastMsg(location.state.message);
            setShowToast(true);

            const time = setTimeout(() => {
                setShowToast(false);
            }, 4000);

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
                <img src="src/assets/forge.png" alt="logo" className="logo" onClick={()=>navigate("/home")}/>
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

            <Link to="/login">
                <button className="login-signup">login/sign-up</button>
            </Link>

            <Hero />
            <Background />
        </>
    );
}

export default Front;