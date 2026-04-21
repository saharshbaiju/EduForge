import React from "react";
import "./video.css";
import Custom_player from "../customplayer/Custom_player";

export default function Video({videoId}){
    return(
        <div className="video-container">
            <Custom_player videoId={videoId}/>
        </div>

    )
}

