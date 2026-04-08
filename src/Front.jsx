import React from "react";
import Background from "./components/background/Background";
import { useState } from "react";

function Front(){

    return(
        <>
        <div className="front-container">
        <h1 className="eduforge-heading">EduForge</h1>
        <h5 className="caption">Where knowledge is forged, not scrolled.</h5>
        <form>
            <div className="wrapper-front">
            <input type="search" 
            placeholder="Search skills ..."
            className="search" />
           <button className="search-button"><img src="src/assets/search.svg" alt="search" /></button>
            </div>
        </form>
        </div>
        <button className="login-signup">login/sign-up</button>
        <Background/>
        </>
    );

}

export default Front



















































































































































































































