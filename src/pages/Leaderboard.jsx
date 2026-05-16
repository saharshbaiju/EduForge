
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiArrowLeft, FiUser, FiZap } from "react-icons/fi";
import Background from "../components/background/Background";
const forgeLogo = "/forge.png";
import "./leaderboard.css";
import { API_BASE_URL } from "../config";

const LeaderboardRow = ({ user, rank, onClick }) => (
    <div className="leaderboard-row" onClick={() => onClick(user.username)}>
        <div className="row-rank">#{rank}</div>
        <div className="row-user">
            <img 
                src={user.profile_image_url || forgeLogo} 
                alt={user.display_name} 
                className="row-avatar"
            />
            <div className="row-info">
                <h3>{user.display_name || user.username}</h3>
                <p>{user.role_title || "Learner"}</p>
            </div>
        </div>
        <div className="row-xp">
            <FiZap size={14} style={{ marginRight: '4px' }} />
            {user.xp_score.toLocaleString()} XP
        </div>
        <div className="row-level">Lvl {user.level}</div>
    </div>
);

const PodiumItem = ({ user, rank, onClick }) => (
    <div className={`podium-item rank-${rank}`} onClick={() => onClick(user.username)}>
        <div className="podium-avatar-wrapper">
            <img 
                src={user.profile_image_url || forgeLogo} 
                alt={user.display_name} 
                className="podium-avatar"
            />
            <div className="podium-rank-badge">{rank}</div>
        </div>
        <div className="podium-name">{user.display_name || user.username}</div>
        <div className="podium-xp">{user.xp_score.toLocaleString()} XP</div>
    </div>
);

export default function Leaderboard({ user }) {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/leaderboard`);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                }
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const handleUserClick = (targetUsername) => {
        navigate(`/profile/${encodeURIComponent(targetUsername)}`);
    };

    const podiumUsers = leaderboard.slice(0, 3);
    const listUsers = leaderboard.slice(3);

    return (
        <div className="leaderboard-page">
            <Background />
            
            <div className="leaderboard-container">
                <button className="btn-icon" onClick={() => navigate("/home")} style={{ marginBottom: '2rem' }}>
                    <FiArrowLeft /> Back to Home
                </button>

                <header className="leaderboard-header">
                    <h1>Hall of Flame</h1>
                    <p>The top minds in the EduForge ecosystem</p>
                </header>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="skeleton" style={{ height: '300px', borderRadius: '24px' }}></div>
                    </div>
                ) : (
                    <>
                        {podiumUsers.length > 0 && (
                            <div className="podium-container">
                                {podiumUsers[1] && <PodiumItem user={podiumUsers[1]} rank={2} onClick={handleUserClick} />}
                                {podiumUsers[0] && <PodiumItem user={podiumUsers[0]} rank={1} onClick={handleUserClick} />}
                                {podiumUsers[2] && <PodiumItem user={podiumUsers[2]} rank={3} onClick={handleUserClick} />}
                            </div>
                        )}

                        <div className="leaderboard-list">
                            {listUsers.map((u, index) => (
                                <LeaderboardRow 
                                    key={u.username} 
                                    user={u} 
                                    rank={index + 4} 
                                    onClick={handleUserClick}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
