import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react';
import axios from 'axios';
export const serverUrl="http://localhost:8000";
function App() {
  useEffect(()=>{
    const getUser=async()=>{
      try{
        const result=await axios.get(serverUrl+"/api/user/current-user",{withCredentials:true});
        console.log(result.data);
      }catch(error){
        console.log(`Error fetching user data: ${error}`);
      }
    }
    getUser();
  },[])
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
      </Routes>
    </div>
  )
}

export default App
