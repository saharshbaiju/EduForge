import React from "react";
import Background from "../components/background/Background";
import { useState } from "react";
import Top_panel from "../components/top-panel/Top_panel";
import Homecard from "../components/cards/Homecard";
import Video from "../components/video/Video";



function Home({user}){
const [data,setdata] = useState([]);
const [isplaying,setisplaying] = useState(false);
const [currentvideoId, setcurrentvideoId] = useState("");

return(
<div className="home-container">

<Top_panel data={data} setdata={setdata} setisplaying={setisplaying}/>
<Background />

{isplaying=== false && <Homecard data={data} setisplaying={setisplaying} setcurrentvideoId={setcurrentvideoId} />}
{isplaying === true && <Video videoId={currentvideoId}/> }
</div>
);

}
export default Home;

