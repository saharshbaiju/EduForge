import React, { useEffect, useRef, useState } from "react";
import "./custom_player.css";

export default function Custom_player({ videoId }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [watchTime, setWatchTime] = useState(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const loadPlayer = () => {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 1,          // default controls
          modestbranding:1 ,   // reduce YouTube logo
          rel: 0,              // no unrelated videos
        },
        events: {
          onStateChange: handleStateChange,
        },
      });
    };

    // load API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = loadPlayer;
    } else if (window.YT.Player) {
      loadPlayer();
    }

    // cleanup
    return () => {
      playerRef.current?.destroy();
    };
  }, [videoId]);

  const handleStateChange = (e) => {
    if (e.data === window.YT.PlayerState.PLAYING) {
      startTimeRef.current = Date.now();
    }

    if (
      e.data === window.YT.PlayerState.PAUSED ||
      e.data === window.YT.PlayerState.ENDED
    ) {
      const played = (Date.now() - startTimeRef.current) / 1000;
      setWatchTime((prev) => prev + played);
    }
  };

  return (
    <div className="">
      <div ref={containerRef}></div>
      <p>Watch Time: {watchTime.toFixed(2)} sec</p>
    </div>
  );
}