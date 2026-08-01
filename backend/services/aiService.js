const path = require("path");

function getStructuredFallback(mode, subjectClean, noteClean, prompt) {
    if (mode === "summary") {
        return `### 📚 Executive Summary: ${noteClean}\n\n- **Primary Focus**: Comprehensive study notes covering core principles in **${subjectClean}**.\n- **Key Takeaways**: Detailed breakdown of theoretical definitions, algorithms, and system design.\n- **Exam Tip**: Focus on core algorithms, step-by-step proofs, and solved numerical problems.`;
    } else if (mode === "questions") {
        return `### ❓ High-Yield Exam Questions: ${noteClean}\n\n1. **Q1**: Explain the fundamental working principles of ${subjectClean}.\n   - *Ans*: Review key definitions and block diagrams.\n2. **Q2**: Differentiate between primary algorithms and their time complexity trade-offs.\n   - *Ans*: Analyze asymptotic bounds and memory footprints.\n3. **Q3**: What are the most common edge cases in algorithm design for this topic?\n   - *Ans*: Examine boundary conditions and error handling.`;
    } else {
        return `### 💡 AI Tutor Insight on "${prompt || "Study Material"}"\n\nFor **${subjectClean}** (${noteClean}):\n- Understand the underlying data structures and execution flow.\n- Refer to verified textbook references in the study note for step-by-step examples.`;
    }
}

async function askAI({ semester, subject, note, prompt, mode }) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    const subjectClean = (subject || "").replace(/-/g, " ");
    const noteClean = (note || "").replace(".pdf", "").replace(/-/g, " ");

    if (!apiKey) {
        console.log("ℹ️ GEMINI_API_KEY is not set in environment variables.");
        return getStructuredFallback(mode, subjectClean, noteClean, prompt);
    }

    let userInstruction = "";
    if (mode === "summary") {
        userInstruction = `Provide a high-impact, 3-to-4 bullet point executive summary of key concepts in ${noteClean} for ${subjectClean}. Include key formulas, definitions, and an exam tip. Keep it structured, clear, and encouraging.`;
    } else if (mode === "questions") {
        userInstruction = `Generate 5 high-yield university exam questions with concise model answer pointers based on ${noteClean} in ${subjectClean}. Format using clear markdown numbers and bold questions.`;
    } else {
        userInstruction = `User Question: "${prompt}"\nProvide a concise, clear, and accurate academic answer tailored for a Computer Science student studying ${subjectClean}. Use markdown formatting with bullet points or code blocks if relevant.`;
    }

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: `You are SleepyStudies AI, an expert academic tutor for Computer Science & Engineering students.\nSubject: ${subjectClean}\nNote: ${noteClean}\n\n${userInstruction}`
                    }
                ]
            }
        ]
    };

    const modelsToTry = [
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash"
    ];

    for (const modelName of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": apiKey
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (candidateText && candidateText.trim().length > 0) {
                    return candidateText.trim();
                }
            } else {
                const errJson = await res.json().catch(() => ({}));
                console.error(`Gemini API ${modelName} HTTP ${res.status}:`, JSON.stringify(errJson));
            }
        } catch (err) {
            console.error(`Fetch error with model ${modelName}:`, err.message);
        }
    }

    return getStructuredFallback(mode, subjectClean, noteClean, prompt);
}

module.exports = {
    askAI,
};
