"use client";

import { useState, useEffect } from "react";
import { Sparkles, Send, Bot, User, X, Check, Copy, HelpCircle, BookOpen, Loader2 } from "lucide-react";
import { API_URL } from "@/utils/api";

type Props = {
    semester: string;
    subject: string;
    note: string;
};

function renderFormattedContent(content: string) {
    if (!content) return null;

    let cleaned = content.replace(/\$\$\\text\{([^}]+)\}([^$]*)\$\$/g, "$1$2");
    cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, "$1");
    cleaned = cleaned.replace(/\\text\{([^}]+)\}/g, "$1");

    const lines = cleaned.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${index}`} className="my-2 p-3 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto break-all border border-slate-800 shadow-inner max-w-full">
                        <code>{codeBlockLines.join("\n")}</code>
                    </pre>
                );
                codeBlockLines = [];
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBlockLines.push(line);
            return;
        }

        if (trimmed.startsWith("### ")) {
            elements.push(
                <h3 key={`h3-${index}`} className="text-sm sm:text-base font-extrabold text-purple-600 dark:text-purple-400 mt-4 mb-2 border-b border-purple-100 dark:border-purple-900/50 pb-1 flex items-center gap-1.5 break-words max-w-full">
                    {trimmed.replace("### ", "")}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("#### ")) {
            elements.push(
                <h4 key={`h4-${index}`} className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 break-words max-w-full">
                    {trimmed.replace("#### ", "")}
                </h4>
            );
            return;
        }

        if (trimmed.startsWith("---")) {
            elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-200 dark:border-slate-800" />);
            return;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
            const formattedText = renderInlineFormatting(trimmed);
            elements.push(
                <div key={`bullet-${index}`} className="flex items-start gap-2 my-1 pl-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 min-w-0 max-w-full">
                    <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="flex-1 leading-relaxed break-words min-w-0 max-w-full">{formattedText}</span>
                </div>
            );
            return;
        }

        if (trimmed === "") {
            elements.push(<div key={`space-${index}`} className="h-2" />);
            return;
        }

        elements.push(
            <p key={`p-${index}`} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1 break-words min-w-0 max-w-full">
                {renderInlineFormatting(line)}
            </p>
        );
    });

    return elements;
}

function renderInlineFormatting(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold text-slate-900 dark:text-white">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={i} className="bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-purple-200 dark:border-purple-800/60 mx-0.5 break-all">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return part;
    });
}

export default function AIAssistant({ semester, subject, note }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Viewer Identity state
    const [registeredName, setRegisteredName] = useState<string>("");
    const [viewerId, setViewerId] = useState<string>("");
    const [nameInput, setNameInput] = useState<string>("");
    const [registering, setRegistering] = useState<boolean>(false);

    const subjectDisplay = (subject || "").replace(/-/g, " ").toUpperCase();
    const noteDisplay = (note || "").replace(".pdf", "").replace(/-/g, " ");

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const viewerRaw = localStorage.getItem("viewer");
                if (viewerRaw) {
                    const parsed = JSON.parse(viewerRaw);
                    if (parsed.name && parsed.name.trim() !== "") {
                        setRegisteredName(parsed.name);
                        setViewerId(parsed.viewerId || parsed.id || "");
                    }
                }
            } catch (e) {}
        }
    }, [isOpen]);

    const handleRegisterName = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed) return;

        setRegistering(true);
        try {
            const res = await fetch(`${API_URL}/viewer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmed }),
            });

            let vId = crypto.randomUUID().slice(0, 8).toUpperCase();
            if (res.ok) {
                const data = await res.json();
                if (data.viewerId) vId = data.viewerId;
            }

            const viewerObj = {
                name: trimmed,
                viewerId: vId,
                id: vId,
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem("viewer", JSON.stringify(viewerObj));
            setRegisteredName(trimmed);
            setViewerId(vId);
        } catch (err) {
            const fallbackId = crypto.randomUUID().slice(0, 8).toUpperCase();
            const viewerObj = {
                name: trimmed,
                viewerId: fallbackId,
                id: fallbackId,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem("viewer", JSON.stringify(viewerObj));
            setRegisteredName(trimmed);
            setViewerId(fallbackId);
        } finally {
            setRegistering(false);
        }
    };

    const handleAsk = async (customPrompt?: string, mode?: string) => {
        const queryText = customPrompt || prompt;
        if (!queryText && !mode) return;

        setPrompt("");
        setLoading(true);
        setResponse(null);

        let activeViewerId = viewerId;
        let activeViewerName = registeredName;

        if (!activeViewerName && typeof window !== "undefined") {
            try {
                const viewerRaw = localStorage.getItem("viewer");
                if (viewerRaw) {
                    const parsed = JSON.parse(viewerRaw);
                    activeViewerId = parsed.viewerId || parsed.id || activeViewerId;
                    activeViewerName = parsed.name || activeViewerName;
                }
            } catch (e) {}
        }

        try {
            const res = await fetch(`${API_URL}/api/ai/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    semester,
                    subject,
                    note,
                    prompt: queryText,
                    mode,
                    viewerId: activeViewerId || "anonymous",
                    viewerName: activeViewerName || "Anonymous Student",
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to reach AI Tutor");
            }

            const data = await res.json();
            setResponse(data.answer || "No response received.");
        } catch (err: any) {
            setResponse(`⚠️ **AI Assistant Connection Note**\n\n${err.message || "Failed to generate response."}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!response) return;
        navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden border border-white/10"
            >
                <Sparkles size={16} className="animate-pulse text-yellow-300" />
                <span>Ask AI Tutor</span>
                <span className="hidden sm:inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                    Gemini 2.0
                </span>
            </button>

            {/* Modal / Slide-over Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative flex flex-col w-full max-w-3xl h-[88vh] max-h-[750px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white shadow-md">
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                            SleepyStudies AI Study Assistant
                                        </h2>
                                        <span className="rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                                            FREE
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                                        {subjectDisplay} • {noteDisplay} {registeredName ? `• ${registeredName}` : ""}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Name Registration Gate for AI Assistant */}
                        {!registeredName ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 mb-4 shadow-md">
                                    <User size={32} />
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    Enter Your Name to Unlock AI Tutor
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6 leading-relaxed font-medium">
                                    Enter your student name once to access AI study summaries, practice exam questions, and custom Q&A.
                                </p>
                                <form onSubmit={handleRegisterName} className="w-full max-w-sm space-y-3">
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="Your Full Name"
                                        required
                                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={registering || !nameInput.trim()}
                                        className="w-full rounded-xl bg-purple-600 py-3.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-purple-500/20"
                                    >
                                        {registering ? "Registering..." : "Continue to AI Tutor"}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <>
                                {/* Quick Prompts Bar */}
                                <div className="flex items-center gap-2 px-6 py-3 bg-slate-100/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto custom-scrollbar">
                                    <button
                                        onClick={() => handleAsk(undefined, "summary")}
                                        disabled={loading}
                                        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500 dark:hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <BookOpen size={13} className="text-purple-500" />
                                        Summarize Module
                                    </button>
                                    <button
                                        onClick={() => handleAsk(undefined, "questions")}
                                        disabled={loading}
                                        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        <HelpCircle size={13} className="text-indigo-500" />
                                        5 Exam Questions
                                    </button>
                                </div>

                                {/* Conversation Body */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 min-w-0 max-w-full">
                                    {!response && !loading && (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 dark:text-slate-500">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 mb-4">
                                                <Sparkles size={32} />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                                                Ask Anything About This Study Note
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 font-medium">
                                                Click a quick prompt above or type your question below to get instant AI summaries, key definitions, and exam practice questions.
                                            </p>
                                        </div>
                                    )}

                                    {loading && (
                                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                            <Loader2 size={36} className="animate-spin text-purple-600 dark:text-purple-400 mb-3" />
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                Generating AI Study Response...
                                            </p>
                                        </div>
                                    )}

                                    {response && !loading && (
                                        <div className="space-y-4 min-w-0 max-w-full">
                                            <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm min-w-0 max-w-full overflow-hidden">
                                                <div className="flex gap-3 text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed min-w-0 max-w-full overflow-hidden flex-1">
                                                    <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs mt-0.5">
                                                        AI
                                                    </div>
                                                    <div className="flex-1 min-w-0 max-w-full font-sans break-words overflow-x-auto">
                                                        {renderFormattedContent(response)}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleCopy}
                                                    className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
                                                    title="Copy Answer"
                                                >
                                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Chat Input Bar */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (prompt.trim() && !loading) {
                                                handleAsk();
                                            }
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (prompt.trim() && !loading) {
                                                        handleAsk();
                                                    }
                                                }
                                            }}
                                            placeholder="Type your question about this note..."
                                            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !prompt.trim()}
                                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors cursor-pointer shadow-md shadow-purple-500/20"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}
        </>
    );
}
