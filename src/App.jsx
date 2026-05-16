
import {Routes, Route} from "react-router-dom"
import Front from "./pages/Front";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useState,useEffect } from "react";
import forgeLogo from "./assets/forge.png";



function App() {
  const [user, setuser] = useState(() => {
  return localStorage.getItem("user") || "";
  });

  const [profileImage, setProfileImage] = useState("");

  const [input, setinput] = useState("");

useEffect(() => {
  localStorage.setItem("user", user);
  if (user) {
    fetch(`http://localhost:5000/profile/${encodeURIComponent(user)}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile && data.profile.profile_image_url) {
          setProfileImage(data.profile.profile_image_url);
        } else {
          setProfileImage(forgeLogo);
        }
      })
      .catch(err => {
        console.error("Error fetching profile image:", err);
        setProfileImage(forgeLogo);
      });
  } else {
    setProfileImage("");
  }
  }, [user]);

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login setuser={setuser} user={user}/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/" element={<Front user={user} input={input} setinput={setinput} profileImage={profileImage}/>}/>
      <Route path="/home" element={<Home user={user} profileImage={profileImage}/>}/>
      <Route path="/profile" element={<Profile user={user} setuser={setuser} setGlobalProfileImage={setProfileImage}/>}/>
    </Routes>
    </>
  )
}

export default App;
