import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./custom_player.css";

const Custom_player = forwardRef(function Custom_player({ videoId, onWatchTimeUpdate, onUnmount }, ref) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [watchTime, setWatchTime] = useState(0);
  const startTimeRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    onWatchTimeUpdate?.(watchTime);
  }, [watchTime, onWatchTimeUpdate]);

  const measureActivePlayback = () => {
    if (!isPlayingRef.current || !startTimeRef.current) return 0;

    const played = (Date.now() - startTimeRef.current) / 1000;
    if (played <= 0) return 0;

    // Resetting here to prevent double counting if called multiple times
    isPlayingRef.current = false;
    startTimeRef.current = 0;
    return played;
  };

  const commitActivePlayback = () => {
    const played = measureActivePlayback();
    if (played > 0) {
      setWatchTime((prev) => prev + played);
    }
    return played;
  };

  useImperativeHandle(ref, () => ({
    flushWatchTime() {
      return commitActivePlayback();
    },
  }));

  useEffect(() => {
    setWatchTime(0);
    startTimeRef.current = 0;
    isPlayingRef.current = false;

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
      const finalPlayed = measureActivePlayback();
      if (finalPlayed > 0) {
        onUnmount?.(finalPlayed);
      }
      playerRef.current?.destroy();
    };
  }, [videoId]);

  const handleStateChange = (e) => {
    if (e.data === window.YT.PlayerState.PLAYING) {
      isPlayingRef.current = true;
      startTimeRef.current = Date.now();
    }

    if (
      e.data === window.YT.PlayerState.PAUSED ||
      e.data === window.YT.PlayerState.ENDED
    ) {
      commitActivePlayback();
    }
  };

  return (
    <div className="customPlayerContainer">
      <div className="player-wrapper">
        <div ref={containerRef}></div>
      </div>
    </div>
  );
});

export default Custom_player;
