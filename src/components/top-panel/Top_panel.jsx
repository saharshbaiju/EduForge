import "./Top_panel.css"
import { useEffect, useState } from "react"


export default function Top_panel({ data, setdata }){
    const [input,setinput] = useState("");
    const [query,setquery] = useState("");
    
    const handlesubmit = (e) => {
        e.preventDefault();
        setquery(input);
        console.log(query)
    }
    // useEffect(()=>{
    //     if (!query.trim()) return;
    //     const timer = setTimeout(()=>{
    //         fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`)
    //         .then(res => res.json())
    //         .then(data => setDetails(data.results))
    //         .catch(err => console.error(err))
    //     },400);

    //     return ()=>clearTimeout(timer);
    // },[query]);

    useEffect(()=> {
        async function getData(query){
            const url = "https://www.googleapis.com/youtube/v3/search";
            const params = new URLSearchParams({
                part: "snippet",
                q: query,
                type: "video",
                maxResults: 10,
                key: "AIzaSyCCRU7MzJx85y_QID0fXAUwqaRaUO4hBtU"
                });
            
            try {
                const res = await fetch(`${url}?${params}`);
                const data = await res.json();
                console.log(data.items);
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
           <button type="submit" className="sd search-button"><img src="src/assets/search.svg" alt="search" /></button>
            </div>
        </form>
        <button className="profile"></button>
        </div>
    )
}