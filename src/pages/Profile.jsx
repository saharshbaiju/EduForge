import React from "react";
import Background from "../components/background/Background";
import Top_panel from "../components/top-panel/Top_panel";
import Heatmap from "../components/Heatmap/Heatmap";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Profile({ user }) {
    const navigate = useNavigate();

    return (
        <div>
            <Background />
            <img 
              src="src/assets/forge.png" 
              alt="logo" 
              className="logo" 
              onClick={() => navigate("/home")}
            />

            {/* ✅ Always load if user exists */}
            {user && <Heatmap username={user} />}
        </div>
    );
}
export default Profile;