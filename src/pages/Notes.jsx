
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    FiSearch, 
    FiPlus, 
    FiFileText, 
    FiMoreVertical, 
    FiClock, 
    FiArrowLeft,
    FiInbox
} from "react-icons/fi";
import Background from "../components/background/Background";
import forgeLogo from "../assets/forge.png";
import "./notes.css";

const NoteCard = ({ note, onClick }) => {
    const preview = note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? "..." : "") : "No content";
    const date = new Date(note.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="note-card" onClick={() => onClick(note.video_id)}>
            <div className="note-card-header">
                <div className="note-icon">
                    <FiFileText />
                </div>
                <span className="note-date">{date}</span>
            </div>
            <div className="note-card-body">
                <h3>{note.title || "Untitled Note"}</h3>
                <p className="note-preview">{preview}</p>
            </div>
            <div className="note-card-footer">
                <span className="note-meta-info">
                    <FiClock size={12} /> {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

const NotesSkeleton = () => (
    <div className="notes-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="note-card skeleton" style={{ height: '200px' }}></div>
        ))}
    </div>
);

export default function Notes({ user, profileImage }) {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchNotes = async () => {
            try {
                const response = await fetch(`http://localhost:5000/notes/${encodeURIComponent(user)}`);
                if (response.ok) {
                    const data = await response.json();
                    setNotes(data);
                }
            } catch (err) {
                console.error("Error fetching notes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [user, navigate]);

    const filteredNotes = notes
        .filter(note => 
            (note.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             note.content?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === "newest") return new Date(b.updated_at) - new Date(a.updated_at);
            if (sortBy === "oldest") return new Date(a.updated_at) - new Date(b.updated_at);
            if (sortBy === "alphabetical") return (a.title || "").localeCompare(b.title || "");
            return 0;
        });

    return (
        <div className="notes-page">
            <Background />
            
            <div className="notes-container">
                <header className="notes-header">
                    <div className="notes-title-section">
                        <button className="btn-icon" onClick={() => navigate("/profile")} style={{ marginBottom: '1rem' }}>
                            <FiArrowLeft /> Back to Profile
                        </button>
                        <h1>My Forge Notes</h1>
                        <p>Total {notes.length} notes captured from your learning sessions</p>
                    </div>

                    <div className="notes-toolbar">
                        <div className="notes-search-wrapper">
                            <FiSearch />
                            <input 
                                type="text" 
                                placeholder="Search notes..." 
                                className="notes-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="notes-sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="alphabetical">Alphabetical</option>
                        </select>
                    </div>
                </header>

                {loading ? (
                    <NotesSkeleton />
                ) : filteredNotes.length > 0 ? (
                    <div className="notes-grid">
                        {filteredNotes.map(note => (
                            <NoteCard 
                                key={note.id} 
                                note={note} 
                                onClick={(id) => navigate(`/notes/${id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="notes-empty">
                        <div className="notes-empty-icon">
                            <FiInbox />
                        </div>
                        <h2>No notes found</h2>
                        <p>{searchTerm ? "Try a different search term" : "Start learning and taking notes from any video!"}</p>
                        {!searchTerm && (
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate("/home")}>
                                Go to Home
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
