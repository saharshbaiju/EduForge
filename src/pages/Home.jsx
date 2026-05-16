import React, { useState, useEffect } from "react";
import Background from "../components/background/Background";
import Top_panel from "../components/top-panel/Top_panel";
import Homecard from "../components/cards/Homecard";
import Video from "../components/video/Video";
import { useLocation } from "react-router-dom";




function Home({user, profileImage}){
const [data,setdata] = useState([]);
const [isplaying,setisplaying] = useState(false);
const [currentVideo, setcurrentVideo] = useState(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlQuery = queryParams.get("query") || "";
    const autoPlayId = queryParams.get("video");

    useEffect(() => {
        if (autoPlayId && (!currentVideo || currentVideo.id.videoId !== autoPlayId)) {
            const fetchVideoDetails = async () => {
                const url = "https://www.googleapis.com/youtube/v3/videos";
                const params = new URLSearchParams({
                    part: "snippet,id",
                    id: autoPlayId,
                    key: import.meta.env.VITE_YOUTUBE_API_KEY
                });

                try {
                    const res = await fetch(`${url}?${params}`);
                    const json = await res.json();
                    if (json.items && json.items.length > 0) {
                        const item = json.items[0];
                        // Convert to the format expected by Video component
                        const videoData = {
                            id: { videoId: item.id },
                            snippet: item.snippet
                        };
                        setcurrentVideo(videoData);
                        setisplaying(true);
                    }
                } catch (err) {
                    console.error("Error fetching autoplay video:", err);
                }
            };
            fetchVideoDetails();
        }
    }, [autoPlayId]);

return(
<div className="home-container">

<Top_panel data={data} setdata={setdata} setisplaying={setisplaying} initialQuery={urlQuery} user={user} profileImage={profileImage}/>
<Background />

{isplaying=== false && <Homecard data={data} setisplaying={setisplaying} setcurrentVideo={setcurrentVideo} />}
{isplaying === true && <Video video={currentVideo} setisplaying={setisplaying} data={data} setcurrentVideo={setcurrentVideo} user={user} /> }
</div>
);

}
export default Home;

