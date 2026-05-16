import React, { useState, useEffect } from "react";
import Background from "../components/background/Background";
import Top_panel from "../components/top-panel/Top_panel";
import Homecard from "../components/cards/Homecard";
import Video from "../components/video/Video";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";


const allowedChannels =[
    "freeCodeCamp.org","Programming with Mosh","Traversy Media","The Net Ninja","Fireship","Corey Schafer",
    "MIT OpenCourseWare","Harvard CS50","Khan Academy","CrashCourse","3Blue1Brown","Veritasium",
    "Numberphile","Computerphile","Academind","edureka!","Simplilearn","Great Learning",
    "CodeWithHarry","Apna College","Gate Smashers","Neso Academy","Unacademy","Physics Wallah",
    "Study IQ Education","Learn Engineering","Real Engineering","Practical Machinist",
    "Stanford Online","YaleCourses","Oxford Online","Google Developers","Microsoft Developer",
    "Amazon Web Services","IBM Technology",

    "Unacademy NEET","Aakash BYJU'S NEET","NEETprep","Allen Career Institute",
    "Vedantu NEET Made Ejee","ExamFear Education","Etoos Education","Career Point NEET","MTG Learning Media",

    "Unacademy JEE","Aakash BYJU'S JEE","Vedantu JEE Made Ejee","Competishun","MathonGo",
    "Mohit Tyagi","Career Point JEE","FIITJEE","Resonance","JEE Wallah","Narayana IIT JEE",

    "Made Easy","ACE Academy","Unacademy GATE","Engineering Funda","GATE Academy Plus","Exergic","NPTEL","GeeksforGeeks",

    "Adda247","Testbook","Gradeup (BYJU'S Exam Prep)","BYJU'S Exam Prep","Oliveboard","Wifistudy","Exampur",
    "Utkarsh Classes","Let's Crack UPSC CSE","Vision IAS","Drishti IAS","Insights IAS","ForumIAS",
    "ClearIAS","StudyIQ IAS","Shankar IAS Academy","Plutus IAS","Rau's IAS",

    "LearnNext","Math Antics","Science Channel","National Geographic","Discovery Channel","Peekaboo Kidz",
    "Homeschool Pop","Smile and Learn","Fun Kids Learning","Easy Peasy Homeschool","Free School",

    "UC Berkeley","Caltech","Princeton University","Columbia University","Cornell University",
    "Carnegie Mellon University","University of Cambridge","University of Oxford","ETH Zurich",

    "Harvard University","CERN","NASA","Google Research","Microsoft Research","DeepMind","OpenAI",
    "IBM Research","Allen Institute for AI","Max Planck Society","Nature","Science Magazine","arXiv"
    ];

function Home({user, profileImage}){
const [data,setdata] = useState([]);
const [isplaying,setisplaying] = useState(false);
const [currentVideo, setcurrentVideo] = useState(null);
const [isLoadingInitial, setIsLoadingInitial] = useState(false);
const [trendingTags, setTrendingTags] = useState(["React", "Python", "JavaScript", "AI", "DevOps", "Cybersecurity"]);

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlQuery = queryParams.get("query") || "";
    const autoPlayId = queryParams.get("video");

    const handleTagClick = (tag) => {
        navigate(`/home?query=${encodeURIComponent(tag)}`);
    };

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
    }, [autoPlayId, currentVideo]);

    // Fetch latest skills from multiple APIs if no query is present
    useEffect(() => {
        const fetchInitialSkills = async () => {
            // Only fetch if no search query, no data yet, and not already loading
            if (urlQuery || data.length > 0 || isLoadingInitial) return;
            
            setIsLoadingInitial(true);
            try {
                // API 1: Fetch trending tags from StackOverflow to identify "latest skills"
                const soRes = await fetch("https://api.stackexchange.com/2.3/tags?order=desc&sort=popular&site=stackoverflow&pagesize=3");
                const soData = await soRes.json();
                const tags = soData.items ? soData.items.map(t => t.name) : ["reactjs", "python", "javascript"];

                // API 2: Fetch trending tech repos from GitHub
                const ghRes = await fetch("https://api.github.com/search/repositories?q=stars:>50000+topic:tutorial&sort=updated&per_page=2");
                const ghData = await ghRes.json();
                const ghSkills = ghData.items ? ghData.items.map(repo => repo.name.replace(/-/g, ' ')) : [];

                const combinedTopics = [...new Set([...tags, ...ghSkills])].slice(0, 4);
                
                // Update trending tags state with newly discovered topics
                setTrendingTags(prev => [...new Set([...prev, ...combinedTopics.map(t => t.charAt(0).toUpperCase() + t.slice(1))])]);

                // API 3: Use YouTube to fetch high-quality tutorials for these identified skills
                const allVideos = [];
                for (const topic of combinedTopics) {
                    const url = "https://www.googleapis.com/youtube/v3/search";
                    const params = new URLSearchParams({
                        part: "snippet",
                        q: `latest ${topic} full course 2024`,
                        type: "video",
                        maxResults: 8,
                        key: import.meta.env.VITE_YOUTUBE_API_KEY
                    });
                    
                    try {
                        const res = await fetch(`${url}?${params}`);
                        const json = await res.json();
                        if (json.items) {
                            allVideos.push(...json.items);
                        }
                    } catch (e) {
                        console.error(`Error fetching YouTube data for ${topic}:`, e);
                    }
                }

                // Filter by the established high-quality channels
                const filtered = allVideos.filter(item =>
                    item.snippet && allowedChannels.some(ch =>
                        item.snippet.channelTitle.trim().toLowerCase() === ch.trim().toLowerCase()
                    )
                );

                if (filtered.length > 0) {
                    // Shuffle or just set data
                    setdata(filtered.sort(() => Math.random() - 0.5));
                }
            } catch (err) {
                console.error("Failed to populate latest skills:", err);
            } finally {
                setIsLoadingInitial(false);
            }
        };

        fetchInitialSkills();
    }, [urlQuery, data.length, isLoadingInitial]);

return(
<div className="home-container">

<Top_panel data={data} setdata={setdata} setisplaying={setisplaying} initialQuery={urlQuery} user={user} profileImage={profileImage}/>
<Background />

{isplaying=== false && (
    <>
        <div className="trending-container">
            <span className="trending-title">Trending Skills</span>
            <div className="trending-tags">
                {trendingTags.map(tag => (
                    <button key={tag} onClick={() => handleTagClick(tag)} className="tag-chip">
                        {tag}
                    </button>
                ))}
            </div>
        </div>
        <Homecard data={data} setisplaying={setisplaying} setcurrentVideo={setcurrentVideo} />
    </>
)}
{isplaying === true && <Video video={currentVideo} setisplaying={setisplaying} data={data} setcurrentVideo={setcurrentVideo} user={user} /> }
</div>
);

}
export default Home;

