import "./Top_panel.css"
export default function Top_panel(){
    return(
        <div className="top-panel">
        <form>
            <div className="wrapper-top">
            <input type="search" 
            placeholder="Search skills ..."
            className="search" />
           <button className="search-button"><img src="src/assets/search.svg" alt="search" /></button>
            </div>
        </form>
        <button className="profile"></button>
        </div>
    )
}