"use client"
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel'
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'

function RecordAnswerSection({ mockInterviewQuestion,activeQuestionIndex,interviewData}) {
    const [userAnswer,setUserAnswer]=useState('');
    const {user}=useUser();
    const [loading,setLoading]=useState(false);
    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
      });
      
      useEffect(()=>{
        results.map((result)=>(
            setUserAnswer(prevAns=>prevAns+result?.transcript)
        ))
      },[results])

      useEffect(()=>{
        if(!isRecording&&userAnswer.length>10){
          UpdateUserAnswer();
        }
      
      },[userAnswer])

      const StartStopRecording=async()=>{
        if(isRecording)
          {
            
            stopSpeechToText();
            
           
          }else{
            startSpeechToText();
          }
      }
      const UpdateUserAnswer=async()=>{

        console.log(userAnswer)
        setLoading(true);
        const feedbackPrompt = 'Question:' + mockInterviewQuestion[activeQuestionIndex]?.question +
        ', User Answer:' + userAnswer + '. Based on this question and answer, please provide a JSON response with the following fields: "rating" (a number from 1 to 5) and "feedback" (a short text with improvement suggestions).';
    
    const result = await chatSession.sendMessage(feedbackPrompt);
    const responseText = await result.response.text();
    
    console.log("Raw response text:", responseText); // Log the raw response text to inspect it
    
    // Remove potential formatting issues
    const mockJsonResp = responseText.replace(/```json/g, '').replace(/```/g, '').trim(); 
    
    console.log("Cleaned JSON response text:", mockJsonResp); // Log the cleaned response
    
    try {
        // Validate the JSON response
        const JsonFeedbackResp = JSON.parse(mockJsonResp);
    
        const resp = await db.insert(UserAnswer)
            .values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: JsonFeedbackResp?.rating,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY')
            });
    
        if (resp) {
            toast('User Answer recorded successfully');
            setUserAnswer('');
            setResults([]);
        }
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        toast('Failed to record user answer. Please try again.');
    }
          setResults([]);
          setLoading(false);
      }

  return (
    <div className='flex items-center justify-center flex-col'>
        <div className='flex flex-col mt-20 justify-center items-center bg-black rounded-lg p-5'>
            <Image src={'/webcam.jpeg'} width={200} height={200} 
            className='absolute'/>
            <Webcam
            mirrored={true}
            style={{
                height:300,
                width:'100%',
                zIndex:10,

            }}
            />
        </div>
        <Button 
        disabled={loading}
        variant='outline' className='my-10'
        onClick={StartStopRecording}
        >
            {isRecording?
            <h2 className='text-red-600 animate-pulse flex gap-2 items-center'>
                <StopCircle/>Stop Recording
            </h2>
            :
            <h2 className='text-primary flex gap-2 items-center'>
              <Mic/> Record Answer</h2>}</Button>
    
    </div>
  )
}

export default RecordAnswerSection
