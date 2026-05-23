import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi } from '../services/openRouter.service.js';

// Extract text from uploaded PDF and analyze
export const analyzeResume = async (req, res) => {
    try {
        // Require uploaded file
        if (!req.file) {
            return res.status(400).json({ message: "Resume Required" });
        }

        // Uploaded file path
        const filepath = req.file.path;

        // Read file
        const fileBuffer = await fs.promises.readFile(filepath);

        // Convert to Uint8Array
        const uint8Array = new Uint8Array(fileBuffer);

        // Load PDF with pdfjsLib
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

        // Collect text
        let resumeText = "";

        // Loop pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            // Get page
            const page = await pdf.getPage(pageNum);

            // Get text items
            const content = await page.getTextContent();

            // Combine item strings
            const pageText = content.items.map((item) => item.str).join(" ");

            // Append page text
            resumeText += pageText + "\n";
        }

        // Normalize whitespace
        resumeText = resumeText.replace(/\s+/g, " ").trim();

        // Next: analyze/persist/return

        const messages=[
            {role:"system",
                content:`Extract structured data from resume.
                Return Strictly JSON:
                
                {
                "role":"stirng",
                "experience":"string",
                "projects":["project1","project2"],
                "skills":["skill1","skill2"]

                }`
            },
            {role:"user",
             content:resumeText
            }
        ];


        const aiResponse=await askAi(messages);

        const parsed=JSON.parse(aiResponse.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim());
        fs.unlinkSync(filepath)


        res.json({
            role:parsed.role,
            experience:parsed.experience,
            projects:parsed.projects,
            skills:parsed.skills,
            resumeText
        });

    } catch (error) {
       console.error(error)
       if(req.file && req.file.path){
        fs.unlinkSync(req.file.path);
       }
       return res.status(500).json({message:error.message})
    }
};