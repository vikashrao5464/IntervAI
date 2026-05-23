import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react';
import axios from 'axios';
export const serverUrl="http://localhost:8000";
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';
import InterviewPage from './pages/InterviewPage';
function App() {

  const dispatch=useDispatch();
  useEffect(()=>{
    const getUser=async()=>{
      try{
        const result=await axios.get(serverUrl+"/api/user/current-user",{withCredentials:true});
        dispatch(setUserData(result.data));
      }catch(error){
        console.log(`Error fetching user data: ${error}`);
        dispatch(setUserData(null));
      }
    }
    getUser();
  },[dispatch])
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/interview' element={<InterviewPage/>}/>
        {/* <Route path='/interviewPage' element={<InterviewPage/>}/> */}
        

      </Routes>
    </div>
  )
}

export default App
