
import express from 'express';
import { analyzeResume } from '../controllers/interview.controller.js';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { generateQuestions, submitAnswer, finishInterview } from '../controllers/interview.controller.js';

const interviewRouter=express.Router();
interviewRouter.post('/resume',isAuth,upload.single("resume"),analyzeResume);
interviewRouter.post('/generate-questions',isAuth,generateQuestions);
interviewRouter.post('/submit-answer',isAuth,submitAnswer);
interviewRouter.post('/finish',isAuth,finishInterview);


export default interviewRouter;