import React from 'react'

function Step3Report({report}) {

  if(!report){
    return(
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>Loading report...</p>
      </div>
    );
  }

  const {
    finalScore=0,
    confidence=0,
    communication=0,
    correctness=0,
    questionWiseScore=[]
  }=report;

  const questionScoreData=questionWiseScore.map((item,index)=>({
    question:`Q${index+1}`,
    score:item.score || 0
  }));

  const skills=[
    {label:'Confidence',value:confidence},
    {label:'Communication',value:communication},
    {label:'Correctness',value:correctness}
  ];

  let performanceTask="";
  let shortTagline="";

  if(finalScore>=8){
    performanceTask="Ready for job oppurnities.";
    shortTagline="Excellent Clarity and Structured Responses.";
  }else if(finalScore>=5){
    performanceTask="Needs minor improvement before interviews.";
    shortTagline="Good understanding but work on clarity.";
  }else{
    performanceTask="significant improvement needed.";
    shortTagline="Work on clarity and confidence.";
  }
   
  return ( 
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-green-50 px-4 sm:px-6 lg:px-10 py-8'>
       fdghj
    </div>
  )
}

export default Step3Report
