const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

function getAIClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== "") {
        if (!genAI) {
            genAI = new GoogleGenerativeAI(apiKey.trim());
        }
        return genAI;
    }
    return null;
}

function getStructuredFallback(mode, subjectClean, noteClean, prompt) {
    if (mode === "summary") {
        return `### 📚 Core Executive Summary: ${noteClean}\n\n- **Primary Focus**: Comprehensive study notes on key computer science principles in **${subjectClean}**.\n- **Key Takeaway**: Detailed breakdown of theoretical concepts, core algorithms, and structural architecture.\n- **Exam Tip**: Pay special attention to core definitions, step-by-step algorithms, and solved numerical examples.`;
    } else if (mode === "questions") {
        return `### ❓ High-Yield Exam Practice Questions: ${noteClean}\n\n1. **Q1**: Explain the core architecture and fundamental working principles of ${subjectClean}.\n   - *Ans*: Review key definitions and block diagrams in Module I.\n2. **Q2**: Differentiate between primary algorithms and their time complexity trade-offs.\n   - *Ans*: Focus on asymptotic analysis and spatial constraints.\n3. **Q3**: What are the most common edge cases in algorithm design for this topic?\n   - *Ans*: Analyze boundary conditions and error handling logic.`;
    } else {
        return `### 💡 AI Tutor Insight on "${prompt}"\n\nFor **${subjectClean}** (${noteClean}):\n- Focus on understanding underlying data structures and execution flow.\n- Refer to the verified textbook references in the note for step-by-step proofs.`;
    }
}

async function askAI({ semester, subject, note, prompt, mode }) {
    const client = getAIClient();
    const subjectClean = (subject || "").replace(/-/g, " ");
    const noteClean = (note || "").replace(".pdf", "").replace(/-/g, " ");

    if (!client) {
        return getStructuredFallback(mode, subjectClean, noteClean, prompt);
    }

    let systemPrompt = `You are SleepyStudies AI, an expert academic tutor for Computer Science & Engineering students.\n`;
    systemPrompt += `Subject: ${subjectClean}\n`;
    systemPrompt += `Document/Module: ${noteClean}\n\n`;

    if (mode === "summary") {
        systemPrompt += `Task: Provide a high-impact, 3-to-4 bullet point executive summary of key concepts in ${noteClean} for ${subjectClean}. Include key formulas, definitions, and an exam tip. Keep it structured, clear, and encouraging.`;
    } else if (mode === "questions") {
        systemPrompt += `Task: Generate 5 high-yield university exam questions with concise model answer pointers based on ${noteClean} in ${subjectClean}. Format using clear markdown numbers and bold questions.`;
    } else {
        systemPrompt += `User Question: "${prompt}"\nTask: Provide a concise, clear, and accurate academic answer tailored for a Computer Science student studying ${subjectClean}. Use markdown formatting with bullet points or code blocks if relevant.`;
    }

    const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro"];

    for (const modelName of candidateModels) {
        try {
            const model = client.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(systemPrompt);
            const responseText = result.response.text();
            if (responseText && responseText.trim().length > 0) {
                return responseText;
            }
        } catch (err) {
            console.error(`Gemini model ${modelName} error:`, err.message);
        }
    }

    // Fallback if model names or API key encounter temporary issues
    return getStructuredFallback(mode, subjectClean, noteClean, prompt);
}

module.exports = {
    askAI,
};
