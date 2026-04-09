import "./Homecard.css"

function Homecard({data}){

    function handleclick(data){
        console.log(data)
    }
    return(
        <>
        <div className="card-wrapper">
            {data.map((item)=> (
                <div className="card" key={item.id.videoId}>
                     {/* onClick={() => handleclick(item)} */}

                <img src={item.snippet.thumbnails.high.url} alt="thumbnail" />
                <h2 >{item.snippet.title}</h2>
                <h4>{item.snippet.channelTitle}</h4>
                </div>


            ))}
            
        </div>
        
        </>
    )
}

export default Homecard;


