require('dotenv').config(); 
const { OpenAI } = require('openai');
const { logAttempt } = require('./database.js'); 

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function triageIssue(issueDescription) {
    let attempts = 0;
    const maxAttempts = 3;
    
    // The "broken" prompt to force a failure
    let currentPrompt = `Analyze this GitHub issue. Start your response with the exact words "Here is the data:" and then provide a JSON object with keys "priority" and "category". \n\nIssue: ${issueDescription}`;

    console.log(`Starting triage for issue: "${issueDescription.substring(0, 30)}..."`);

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n--- Attempt ${attempts} ---`);
        
        // 🚨 THE FIX: Declare rawText out here so the catch block can see it!
        let rawText = ""; 
        
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o", 
                messages: [{ role: "user", content: currentPrompt }],
            });

            // Assign the value here
            rawText = response.choices[0].message.content.trim();
            console.log("Raw AI Response:\n", rawText);

            const validatedData = JSON.parse(rawText); 
            
            console.log("✅ Success! Valid JSON parsed:", validatedData);
            await logAttempt(issueDescription, rawText, 'success', attempts);
            return validatedData; 

        } catch (error) {
            console.log(`❌ Failed to parse JSON. Error: ${error.message}`);
            
            if (attempts < maxAttempts) {
                console.log("🤖 Auto-correcting: Sending the error back to the AI so it can fix itself...");
                
                // Now it can successfully read rawText!
                currentPrompt = `Your previous response failed to parse as JSON. Please fix it. \nError: ${error.message} \nPrevious output: ${rawText} \nRemember: Return ONLY valid JSON, no markdown, no other text.`;
            } else {
                console.log("🚨 Max attempts reached. Failing gracefully.");
                await logAttempt(issueDescription, "Failed to get valid JSON", 'failed', attempts);
                return null;
            }
        }
    }
}

async function runTest() {
    const fakeIssue = "The login button on the mobile app is completely broken and crashes the app when I click it. Please fix ASAP!";
    await triageIssue(fakeIssue);
}

runTest();