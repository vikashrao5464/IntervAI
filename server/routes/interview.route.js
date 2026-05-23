
import express from 'express';
import { analyzeResume } from '../controllers/interview.controller.js';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';

const interviewRouter=express.Router();
interviewRouter.post('/resume',isAuth,upload.single("resume"),analyzeResume);


export default interviewRouter;