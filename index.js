require('dotenv').config(); 
const express = require('express');
const { OpenAI } = require('openai');
const { logAttempt } = require('./database.js'); 

const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function triageIssue(issueDescription) {
    let attempts = 0;
    const maxAttempts = 3;
    
    let currentPrompt = `Analyze this GitHub issue. Start your response with the exact words "Here is the data:" and then provide a JSON object with keys "priority" and "category". \n\nIssue: ${issueDescription}`;

    while (attempts < maxAttempts) {
        attempts++;
        let rawText = ""; 
        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", 
                messages: [{ role: "user", content: currentPrompt }],
            });

            rawText = response.choices[0].message.content.trim();
            const validatedData = JSON.parse(rawText); 
            
            await logAttempt(issueDescription, rawText, 'success', attempts);
            
            // Return both the data AND how many attempts it took
            return { result: validatedData, attempts: attempts }; 

        } catch (error) {
            if (attempts < maxAttempts) {
                currentPrompt = `Your previous response failed to parse as JSON. Please fix it. \nError: ${error.message} \nPrevious output: ${rawText} \nRemember: Return ONLY valid JSON, no markdown, no other text.`;
            } else {
                await logAttempt(issueDescription, "Failed to get valid JSON", 'failed', attempts);
                return { result: { error: "Failed to parse after 3 attempts" }, attempts: attempts };
            }
        }
    }
}

// Create the API endpoint for the UI to call
app.post('/api/triage', async (req, res) => {
    const userIssue = req.body.issue;
    console.log(`\nUI requested triage for: "${userIssue}"`);
    
    const finalData = await triageIssue(userIssue);
    res.json(finalData); // Send the data back to the browser
});

// Start the server!
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server is running! Open your browser and go to: http://localhost:${PORT}`);
});