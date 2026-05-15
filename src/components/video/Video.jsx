import React, { useState, useEffect, useRef } from "react";
import "./video.css";
import Custom_player from "../customplayer/Custom_player";

import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    UndoRedo
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

export default function Video({
    video,
    setisplaying,
    data,
    setcurrentVideo,
    user
}) {
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [watchTime, setWatchTime] = useState(0);
    const [showRelated, setShowRelated] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [fullDescription, setFullDescription] = useState("");

    const editorRef = useRef(null);

    if (!video) return null;

    const videoId = video.id.videoId;

    // Fetch full video description
    useEffect(() => {
        if (videoId) {
            const fetchVideoDetails = async () => {
                const url = "https://www.googleapis.com/youtube/v3/videos";
                const params = new URLSearchParams({
                    part: "snippet",
                    id: videoId,
                    key: import.meta.env.VITE_YOUTUBE_API_KEY
                });

                try {
                    const res = await fetch(`${url}?${params}`);
                    const data = await res.json();
                    if (data.items && data.items.length > 0) {
                        setFullDescription(data.items[0].snippet.description);
                    } else {
                        setFullDescription(video.snippet.description);
                    }
                } catch (err) {
                    console.error("Error fetching full description:", err);
                    setFullDescription(video.snippet.description);
                }
            };
            fetchVideoDetails();
        }
    }, [videoId, video.snippet.description]);

    // Filter current video out of related videos
    const relatedVideos = data.filter(
        (item) => item.id.videoId !== video.id.videoId
    );

    // Fetch notes
    useEffect(() => {
        if (user && video.id.videoId) {
            // Clear editor first
            if (editorRef.current) {
                editorRef.current.setMarkdown("");
            }

            setNotes("");

            fetch(`http://localhost:5000/notes/${user}/${video.id.videoId}`)
                .then((res) => res.json())
                .then((data) => {
                    const fetchedContent = data.content || "";

                    setNotes(fetchedContent);

                    if (editorRef.current) {
                        editorRef.current.setMarkdown(fetchedContent);
                    }
                })
                .catch((err) =>
                    console.error("Error fetching notes:", err)
                );
        }
    }, [user, video.id.videoId]);

    const handleSaveNotes = async () => {
        setIsSaving(true);

        try {
            const response = await fetch(
                "http://localhost:5000/notes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: user,
                        video_id: video.id.videoId,
                        content: notes
                    })
                }
            );

            if (response.ok) {
                console.log("Notes saved successfully");
            }
        } catch (err) {
            console.error("Error saving notes:", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="video-page-container">
            <div className="video-header-nav">
                <button
                    className="back-button"
                    onClick={() => setisplaying(false)}
                >
                    &larr; Back to results
                </button>

                <div className="video-actions">
                    <button 
                        className="related-toggle-btn"
                        onClick={() => setShowRelated(!showRelated)}
                    >
                        {showRelated ? "Hide Related Skills" : "Show Related Skills"}
                    </button>
                    
                    <div className="watch-time-display">
                        <span className="watch-time-icon">⏱</span>
                        <span>Watch Time: {watchTime.toFixed(2)} sec</span>
                    </div>
                </div>
            </div>

            {showRelated && (
                <div className="related-videos-dropdown">
                    <h3 className="dropdown-title">Related Skills</h3>
                    <div className="related-videos-grid">
                        {relatedVideos.map((item) => (
                            <div
                                key={item.id.videoId}
                                className="related-video-card"
                                onClick={() => {
                                    setcurrentVideo(item);
                                    setShowRelated(false);
                                    window.scrollTo(0, 0);
                                }}
                            >
                                <img
                                    src={item.snippet.thumbnails.medium.url}
                                    alt={item.snippet.title}
                                    className="related-card-thumb"
                                />
                                <div className="related-card-info">
                                    <h4 className="related-card-title">{item.snippet.title}</h4>
                                    <p className="related-card-channel">{item.snippet.channelTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="video-layout">
                {/* Main Content */}
                <div className="video-main-column">
                    {/* Video Player */}
                    <div className="video-player-section">
                        <Custom_player 
                            videoId={video.id.videoId} 
                            onWatchTimeUpdate={setWatchTime}
                        />
                    </div>

                    {/* Video Info */}
                    <div className="video-info-section">
                        <h1 className="video-title">{video.snippet.title}</h1>

                        <div className="channel-info">
                            <span className="channel-name">
                                {video.snippet.channelTitle}
                            </span>
                        </div>

                        {/* Description */}
                        <div 
                            className={`video-description-container ${showFullDescription ? 'expanded' : 'collapsed'}`}
                            onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                            <p className="video-description">
                                {showFullDescription ? fullDescription : (fullDescription || video.snippet.description)}
                            </p>
                            {!showFullDescription && <div className="description-overlay">Click to read full description</div>}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Now containing Notes */}
                <div className="video-sidebar">
                    <div className="notes-section">
                        <div className="notes-header">
                            <h3>Notes</h3>
                            <button
                                className="save-notes-btn"
                                onClick={handleSaveNotes}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save Notes"}
                            </button>
                        </div>

                        <div className="mdx-editor-wrapper">
                            <MDXEditor
                                ref={editorRef}
                                markdown={notes}
                                onChange={setNotes}
                                className="dark-theme aqua-editor"
                                plugins={[
                                    headingsPlugin(),
                                    listsPlugin(),
                                    quotePlugin(),
                                    thematicBreakPlugin(),
                                    markdownShortcutPlugin(),
                                    toolbarPlugin({
                                        toolbarContents: () => (
                                            <>
                                                <UndoRedo />
                                            </>
                                        )
                                    })
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}