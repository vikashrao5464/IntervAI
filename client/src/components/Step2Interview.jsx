import React from 'react'
import maleVideo from '../assets/Videos/male-ai.mp4';
import femaleVideo from '../assets/Videos/female-ai.mp4';
import Timer from './Timer';
import { motion } from 'motion/react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useState,useEffect } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { BsArrowRight } from 'react-icons/bs';


function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle,setSubtitle]=useState("");
  const [isQuestionReady, setIsQuestionReady] = useState(false);
  const videoRef=useRef(null);

  const currentQuestion = questions[currentIndex];
  const isAnswerLocked = isAIPlaying || isSubmitting || !isQuestionReady;
// load voices and select one

  useEffect(()=>{
       const loadVoice =()=>{
        const voices = window.speechSynthesis.getVoices();
        if(!voices.length) return;
        // try known femal voice first
        const femaleVoice= voices.find(v=>
        v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("female") 
        );

        if(femaleVoice){
          setSelectedVoice(femaleVoice);
          setVoiceGender("female");
          return;
        }


        // try known male voice
        const maleVoice= voices.find(v=>       
           v.name.toLowerCase().includes("david") ||
            v.name.toLowerCase().includes("mark") ||
           v.name.toLowerCase().includes("male")
        );

        if(maleVoice){
          setSelectedVoice(maleVoice);
          setVoiceGender("male");
          return;
        }

        // fallback to first voice(assume female)
        setSelectedVoice(voices[0]);
        setVoiceGender("female");
      };

      loadVoice();
      window.speechSynthesis.onvoiceschanged=loadVoice;
  },[])

  const videoSource=voiceGender==="male"?maleVideo:femaleVideo;


  // speak function
  const speakText=(text)=>{
    return new Promise((resolve)=>{
      if(!window.speechSynthesis || !selectedVoice){
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // stop any ongoing speech

      // add natural pause after punctuation
       const humanText=text
             .replace(/,/g, ", ... ")
             .replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
    
      // human-like pacing
      utterance.rate=0.92;  //slightly slower than normal
      utterance.pitch=1.05  //small warmth
      utterance.volume=1;

      utterance.onstart=()=>{
        setIsAIPlaying(true);
      stopMic();
        videoRef.current?.play();
      };

      utterance.onend=()=>{
        videoRef.current?.pause();
        videoRef.current.currentTime=0;
        setIsAIPlaying(false);
  
         if(isMicOn){
          startMic();
         }


      setTimeout(()=>{
        setSubtitle("");
        resolve();

      },300);  
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    })
  }

  // handle intro and question speaking
  useEffect(()=>{
    if(!selectedVoice){
      return;
    }
    const runIntro=async()=>{
      if(isIntroPhase){
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false);
      }else if(currentQuestion){
        await new Promise(r=>setTimeout(r,800)); // small pause between q&a

        // if last question (hard level)
        if(currentIndex===questions.length -1){
          await speakText('ALright, this one might be a bit more challenging');
        }

        setIsQuestionReady(false);
        await speakText(currentQuestion.question);
        setIsQuestionReady(true);

        if(isMicOn){
          startMic();
        }
      }
    }
    runIntro();
  },[selectedVoice,isIntroPhase,currentIndex])

  // handle timer
  useEffect(()=>{
    if(isIntroPhase)return;
    if(isAIPlaying)return;
    if(!isQuestionReady)return;
  
    if(!currentQuestion)return;
    const timer=setInterval(()=>{
      setTimeLeft((prev)=>{
        if(prev<=1){
          clearInterval(timer);
          return 0;
        }
        return prev-1;
      })
    },1000)
    return()=>clearInterval(timer);
  },[isIntroPhase,currentIndex,isAIPlaying,isQuestionReady])


  useEffect(()=>{
    if(!isIntroPhase && currentQuestion){

    
    setTimeLeft(currentQuestion?.timeLimit || 60);
    }
  },[currentIndex])

  // handle voice to text
  useEffect(()=>{
    if(!("webkitSpeechRecognition" in window)) return;

    const recognition=new window.webkitSpeechRecognition();
    recognition.lang="en-US";
    recognition.interimResults=false;
    recognition.continuous=true; 

    recognition.onresult=(event)=>{
      const transcript=event.results[event.results.length-1][0].transcript;

      setAnswer((prev)=>prev+" "+transcript);
    }
    recognitionRef.current=recognition;
  },[])


  const startMic=()=>{
    if(recognitionRef.current && !isAIPlaying){
      try{
      recognitionRef.current.start();
      }catch{}
    }
  };

  const stopMic=()=>{
    if(recognitionRef.current){
      recognitionRef.current.stop();
    }
  };


  const toggleMic=()=>{
    if(isMicOn){
      stopMic();
    }else{
      startMic();
    }
    setIsMicOn(!isMicOn);
  }

const submitAnswer=async()=>{
  if(isSubmitting) return;
  stopMic();
  setIsSubmitting(true);
  try{
    const result=await axios.post(serverUrl+"/api/interview/submit-answer",{
      interviewId,
      questionIndex:currentIndex,
      answer,
      timeTaken: currentQuestion.timeLimit - timeLeft
    },{withCredentials:true});  
    setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);

  }catch(error){
console.error("Error submitting answer:",error);
setIsSubmitting(false);
  }
}


const handleNext=async()=>{
 setFeedback("");
 setAnswer("");
 setIsQuestionReady(false);
 if(currentIndex+1 >= questions.length){
  finishInterview();
  return;
 }

 await speakText("alright, let's move on to the next question");
 setCurrentIndex(currentIndex+1);
 setTimeout(()=>{
  if(isMicOn){
    startMic();
  }
 },500)
}

const finishInterview=async()=>{
  stopMic();
  setIsMicOn(false);
  try{
    const result=await axios.post(serverUrl+'/api/interview/finish',{
      interviewId
    },{withCredentials:true});

    console.log(result.data);
    onFinish(result.data);
    
  }catch(error){
console.error("Error finishing interview:",error);
  }
}

useEffect(()=>{
if(isIntroPhase) return;
if(!currentQuestion) return;
if(!isQuestionReady) return;
if(timeLeft==0 && !isSubmitting && !feedback){
 submitAnswer();
}
},[timeLeft,isQuestionReady,isIntroPhase,currentQuestion,isSubmitting,feedback])


useEffect(()=>{
  return ()=>{
    if(recognitionRef.current){
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
  window.speechSynthesis.cancel();
  };
},[])


  return (

    <div className='min-h-screen bg-gradient-to-br from-emerald-50
     via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 
      flex flex-col lg:flex-row overflow-hidden'>
        {/* {video section} */}
        <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
          <div className='relative w-full max-w-md h-64 sm:h-72 rounded-2xl overflow-hidden shadow-xl bg-gray-100'>
            <video src={videoSource}
            key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload='auto'
              className='absolute inset-0 w-full h-full object-cover'
            />

            <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4'>
              <p className='text-xs sm:text-sm font-semibold uppercase tracking-wide text-emerald-300'>
                AI Interview Assistant
              </p>
              <p className='mt-1 text-sm sm:text-base font-medium text-white leading-relaxed'>
                {subtitle || ' '}
              </p>
            </div>
          </div>

          {/* timer area */}
          <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-gray-500'>
                Interview Status
              </span>
              { isAIPlaying && (
                <span className='text-sm font-semibold text-emerald-600'>
                {isAIPlaying ? "AI Speaking" : ""}  
                </span>
              )}
            </div>

            <div className='h-px bg-gray-200'></div>

            <div className='flex justify-center'>
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit || 60} />
            </div>

            <div className='h-px bg-gray-200'></div>

            <div className='grid grid-cols-2 gap-6 text-center'>
              <div>
                <span className='text-2xl font-bold text-emerald-600'>{currentIndex+1}</span>
                <span className='text-sm text-gray-400'>Current Question</span>
              </div>

              <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-sm text-gray-400'>Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* text section */}
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>
            AI Smart Interview
          </h2>

         {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm'>
              <p className='text-xs sm:text-sm text-gray-400 mb-2'>Question {currentIndex + 1} of {questions.length}</p>
              <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed '>{currentQuestion?.question}</div>


            </div>
          )}

          <textarea
            placeholder="Type Your Answer Here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={isAnswerLocked}
            className='flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2
           focus:ring-emerald-500 transition text-gray-800 disabled:cursor-not-allowed disabled:opacity-60'/>


          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center
                        rounded-full bg-black text-white shadow-lg'>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
            </motion.button>

            <motion.button
            onClick={submitAnswer}
            disabled={isAnswerLocked}
              whileTap={{ scale: 0.95 }}
              className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4
                         rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed'>
              {isAIPlaying ? "AI Speaking..." : isSubmitting ? "Submitting..." : "Submit Answer"}
            </motion.button>
          </div>):(
            <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm '
            >
         <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
         <button
          onClick={handleNext}
          className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white
                    py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center
                     justify-center gap-1'>
            Next Question <BsArrowRight/>
         </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Step2Interview
