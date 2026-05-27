import React from 'react'
import { useState,useEffect } from 'react';
import axios from 'axios';
import {serverUrl} from '../App';
import { useParams } from 'react-router-dom';
import Step3Report from '../components/Step3Report';

function InterviewReport() {
  const {id}=useParams();
  const [report,setReport]=useState(null);

  useEffect(()=>{
   const fetchreport=async()=>{
    try{
     const result=await axios.get(serverUrl+`/api/interview/report/${id}`,{withCredentials:true});
  
     setReport(result.data);
    }catch(error){
     console.error(`Error fetching report: ${error}`);
    }
   }
   fetchreport();
  }, []);

  if(!report){
    return(
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>Loading report...</p>
      </div>
    )
  }
  return <Step3Report report={report} />;
}

export default InterviewReport
