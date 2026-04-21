import "./Homecard.css"
import { useNavigate } from "react-router-dom";


function Homecard({data , setisplaying , setcurrentvideoId}){
    const navigate = useNavigate();
    const selectVideo = (videoId) => {
        setisplaying(true);
        setcurrentvideoId(videoId)
    };
   
    return(
        <>
        <div className="card-wrapper">
            {data.map((item)=> (
                <div className="card" key={item.id.videoId} onClick={() => selectVideo(item.id.videoId)}>
                     {/* onClick={() => handleclick(item)} */}

                    <img className="image-properties" src={item.snippet.thumbnails.high.url} alt="thumbnail" />
                    <h2 >{item.snippet.title}</h2>
                    <h4>{item.snippet.channelTitle}</h4>
                </div>


            ))}
            
        </div>
        
        </>
    )
}

export default Homecard;


