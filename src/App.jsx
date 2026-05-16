
import {Routes, Route} from "react-router-dom"
import Front from "./pages/Front";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import NoteDetails from "./pages/NoteDetails";
import Leaderboard from "./pages/Leaderboard";
import { useState,useEffect } from "react";
const forgeLogo = "/forge.png";
import { API_BASE_URL } from "./config";



function App() {
  const [user, setuser] = useState(() => {
  return localStorage.getItem("user") || "";
  });

  const [profileImage, setProfileImage] = useState("");

  const [input, setinput] = useState("");

useEffect(() => {
  localStorage.setItem("user", user);
  if (user) {
    fetch(`${API_BASE_URL}/profile/${encodeURIComponent(user)}`)
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
      <Route path="/profile/:username" element={<Profile user={user} setuser={setuser} setGlobalProfileImage={setProfileImage}/>}/>
      <Route path="/notes" element={<Notes user={user} profileImage={profileImage}/>}/>
      <Route path="/notes/:owner/:videoId" element={<NoteDetails user={user} profileImage={profileImage}/>}/>
      <Route path="/leaderboard" element={<Leaderboard user={user} profileImage={profileImage}/>}/>
    </Routes>
    </>
  )
}

export default App;
