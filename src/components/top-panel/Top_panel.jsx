import "./Top_panel.css"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

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

export default function Top_panel({ data, setdata, setisplaying, initialQuery }){
    const [input,setinput] = useState(initialQuery||"");
    const [query,setquery] = useState(initialQuery||"");

    const navigate = useNavigate();

    const toProfile = () =>{
        navigate("/profile");
    }

    useEffect(() => {
        if (initialQuery) {
            setinput(initialQuery);
            setquery(initialQuery);
        }
    }, [initialQuery]);
    
    const handlesubmit = (e) => {
        e.preventDefault();
        setquery(input);
        console.log(query)
    }

    useEffect(()=> {
        if (!query.trim()) return; 

        async function getData(query){
            const url = "https://www.googleapis.com/youtube/v3/search";
            const params = new URLSearchParams({
                part: "snippet",
                q: query,
                type: "video",
                maxResults: 40,
                key: import.meta.env.VITE_YOUTUBE_API_KEY
                });
        
            try {
                const res = await fetch(`${url}?${params}`);
                const data = await res.json();
                console.log(data.items);

                // const allowedChannels = [
                // "freeCodeCamp.org",
                // "Traversy Media",
                // "CodeWithHarry"
                // ];

                

                
                const filtered = (data.items || []).filter(item =>
                    allowedChannels.some(ch =>
                        item.snippet.channelTitle.trim().toLowerCase() === ch.trim().toLowerCase()
                    )
                    );
                setisplaying(false);
                setdata(filtered);
                
            } catch (err) {
                console.error(err);
            }
                
        }
        getData(query)
        console.log("api called")
    },[query])

    return(
        <div className="top-panel">
        <form onSubmit={handlesubmit}>
      
            <div className="wrapper-top">
            <input type="search" 
            value={input}
            onChange={(e) => setinput(e.target.value)}
            placeholder="Search skills ..."
            className="home-search" />
           <button type="submit" className="search-button"><img src="src/assets/search.svg" alt="search" /></button>
            </div>
        </form>
        <button className="profile" onClick={toProfile}></button>
        </div>
    )
}