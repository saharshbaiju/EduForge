
import {Routes, Route} from "react-router-dom"
import Front from "./pages/Front";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import { useState,useEffect } from "react";



function App() {
  const [user, setuser] = useState(() => {
  return localStorage.getItem("user") || "";
  });

useEffect(() => {
  localStorage.setItem("user", user);
  }, [user]);

  return (
    <>
    <Routes>
      <Route path="/login" element={<Login setuser={setuser} user={user}/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/" element={<Front />}/>
      <Route path="/home" element={<Home user={user}/>}/>
      <Route path="/profile" element={<Profile user={user}/>}/>
    </Routes>
    </>
  )
}

export default App;
