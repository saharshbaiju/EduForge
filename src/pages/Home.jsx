import React from "react";
import Background from "../components/background/Background";
import { useState } from "react";
import Top_panel from "../components/top-panel/Top_panel";
import Homecard from "../components/cards/Homecard";
import Video from "../components/video/Video";
import { useLocation } from "react-router-dom";



function Home({user}){
const [data,setdata] = useState([]);
const [isplaying,setisplaying] = useState(false);
const [currentvideoId, setcurrentvideoId] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlQuery = queryParams.get("query") || "";

return(
<div className="home-container">

<Top_panel data={data} setdata={setdata} setisplaying={setisplaying} initialQuery={urlQuery}/>
<Background />

{isplaying=== false && <Homecard data={data} setisplaying={setisplaying} setcurrentvideoId={setcurrentvideoId} />}
{isplaying === true && <Video videoId={currentvideoId} /> }
</div>
);

}
export default Home;

