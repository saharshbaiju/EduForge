
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
    FiArrowLeft, 
    FiEdit2, 
    FiSave, 
    FiX, 
    FiDownload, 
    FiClock, 
    FiCalendar,
    FiCheck,
    FiChevronDown
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import Background from "../components/background/Background";
import "./notes.css";

export default function NoteDetails({ user }) {
    const { owner, videoId } = useParams();
    const navigate = useNavigate();
    
    const isOwnNote = owner === user;
    
    const [note, setNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
    
    const contentRef = useRef(null);
    const exportMenuRef = useRef(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchNote = async () => {
            try {
                const response = await fetch(`http://localhost:5000/notes/${encodeURIComponent(owner)}/${encodeURIComponent(videoId)}`);
                if (response.ok) {
                    const data = await response.json();
                    setNote(data);
                    setEditedContent(data.content || "");
                    setEditedTitle(data.title || "Untitled Note");
                }
            } catch (err) {
                console.error("Error fetching note:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [owner, videoId, navigate, user]);

    // Handle clicks outside export menu to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:5000/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user,
                    video_id: videoId,
                    content: editedContent,
                    title: editedTitle
                })
            });

            if (response.ok) {
                setNote({
                    ...note,
                    content: editedContent,
                    title: editedTitle,
                    updated_at: new Date().toISOString()
                });
                setIsEditing(false);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error("Error saving note:", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportMD = () => {
        const element = document.createElement("a");
        const file = new Blob([editedContent], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${editedTitle || 'note'}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setShowExportMenu(false);
    };

    const handleExportPDF = async () => {
        if (!contentRef.current) return;
        setShowExportMenu(false);
        
        try {
            const element = contentRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#0f172a" // Matching dark theme for PDF
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${editedTitle || 'note'}.pdf`);
        } catch (err) {
            console.error("Error exporting PDF:", err);
        }
    };

    if (loading) {
        return (
            <div className="note-details-page">
                <Background />
                <div className="note-content-area skeleton" style={{ minHeight: '80vh' }}></div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="note-details-page">
                <Background />
                <div className="notes-empty">
                    <h2>Note not found</h2>
                    <button className="btn-primary" onClick={() => navigate("/notes")}>Back to Notes</button>
                </div>
            </div>
        );
    }

    return (
        <div className="note-details-page">
            <Background />
            
            <div className="note-details-toolbar">
                <div className="toolbar-left">
                    <button className="btn-icon" onClick={() => isOwnNote ? navigate("/notes") : navigate(-1)} title="Back">
                        <FiArrowLeft />
                    </button>
                    {saveStatus === 'success' && <span className="save-indicator success"><FiCheck /> Saved</span>}
                </div>
                
                <div className="toolbar-right">
                    <div className="export-menu-container" ref={exportMenuRef}>
                        <button className="btn-outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                            <FiDownload /> Export <FiChevronDown />
                        </button>
                        {showExportMenu && (
                            <div className="export-dropdown">
                                <button className="export-item" onClick={handleExportMD}>
                                    Markdown (.md)
                                </button>
                                <button className="export-item" onClick={handleExportPDF}>
                                    PDF (.pdf)
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {isOwnNote && (!isEditing ? (
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>
                            <FiEdit2 /> Edit Note
                        </button>
                    ) : (
                        <>
                            <button className="btn-outline" onClick={() => setIsEditing(false)}>
                                <FiX /> Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                                <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    ))}
                </div>
            </div>

            <main className="note-content-area" ref={contentRef}>
                {isEditing ? (
                    <div className="note-editor-container">
                        <input 
                            className="note-title-input"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            placeholder="Note Title"
                        />
                        <textarea 
                            className="markdown-textarea"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            placeholder="Write your markdown here..."
                        />
                        <div className="editor-footer">
                            <small>Markdown supported: # H1, **bold**, `code`, etc.</small>
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="note-view-header">
                            <h1>{note.title || "Untitled Note"}</h1>
                            <div className="note-meta">
                                <span><FiCalendar /> {new Date(note.updated_at).toLocaleDateString()}</span>
                                <span><FiClock /> {new Date(note.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </header>
                        <div className="markdown-body">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {note.content || "_No content yet._"}
                            </ReactMarkdown>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
