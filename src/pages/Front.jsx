import React, { useState, useEffect } from "react";
import Background from "../components/background/Background";
import { Link, useLocation } from "react-router-dom";
import Hero from "../components/Hero";
import { useNavigate } from "react-router-dom";
const forgeLogo = "/forge.png";
import searchIcon from "../assets/search.svg";
import { FiFileText, FiAward } from "react-icons/fi";


function Front({user,input, setinput, profileImage}) {
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
                <img src={forgeLogo} alt="logo" className="logo" />
                <div className="front-content">
                    <h1 className="eduforge-heading">EduForge</h1>
                    <h5 className="caption">Where knowledge is forged, not scrolled.</h5>

                    <form onSubmit={handleSearch} className="front-form">
                        <div className="wrapper-front">
                            <input
                                type="search"
                                value={input}
                                onChange={(e) => setinput(e.target.value)}
                                placeholder="Search skills ..."
                                className="front-search"
                            />
                            <button type="submit" className="front-search-button">
                                <img src={searchIcon} alt="search" className="front-search-button"/>
                            </button>
                        </div>
                    </form>
                </div>
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
                    <div className="front-top-actions">
                        <Link to="/leaderboard" className="front-notes-link leaderboard-link">
                            <FiAward size={20} />
                            <span>Leaderboard</span>
                        </Link>
                        <Link to="/notes" className="front-notes-link">
                            <FiFileText size={20} />
                            <span>Notes</span>
                        </Link>
                        <Link to="/profile">
                            <img className="profile-image" src={profileImage} alt="profile image" />
                        </Link>
                    </div>
                )
            }
            

            <Hero />
            <Background />
        </>
    );
}

export default Front;