"use client";

import Link from "next/link";
import { Search, ArrowRight, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useScrollToSubjects } from "@/utils/scrollHelper";
import { API_URL } from "@/utils/api";

type Result = {
    title: string;
    file: string;
    subject: string;
    semester: string;
};

export default function Hero() {
    const router = useRouter();
    const scrollToSubjects = useScrollToSubjects();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [selected, setSelected] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);

            try {
                const res = await fetch(
                    `${API_URL}/search?q=${encodeURIComponent(query)}`
                );

                const data = await res.json();
                setResults(data);
                setSelected(0);
            } catch {
                setResults([]);
            }

            setLoading(false);
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        function outside(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setShow(false);
            }
        }

        document.addEventListener("mousedown", outside);

        return () =>
            document.removeEventListener("mousedown", outside);
    }, []);

    function openNote(note: Result) {
        setShow(false);
        router.push(`/view/${note.semester}/${note.subject}/${note.file}`);
    }

    function highlight(text: string) {
        if (!query) return text;

        const regex = new RegExp(`(${query})`, "ig");

        return text.split(regex).map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index} className="font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-0.5 rounded">
                    {part}
                </span>
            ) : (
                part
            )
        );
    }

    return (
        <section className="relative bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 py-24 md:py-32 transition-colors duration-300">
            {/* Background elements wrapper - keeps glow & mesh patterns clipped without clipping the absolute search results dropdown */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-10%] left-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-blue-400/5 blur-3xl" />
                <div className="absolute bottom-[-10%] right-[10%] -z-10 h-[600px] w-[600px] rounded-full bg-indigo-400/5 blur-3xl" />

                {/* Mesh Grid Pattern */}
                <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
            </div>

            <div className="mx-auto max-w-7xl px-6 text-center relative">
                {/* Floating Top Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm border border-slate-800 animate-fade-in hover:bg-slate-800 transition duration-200 cursor-pointer">
                    <Sparkles size={12} className="text-yellow-400" />
                    <span>Free Notes Repository</span>
                </div>

                {/* Heading */}
                <h1 className="mt-10 text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-7xl lg:text-8xl leading-[1.05] max-w-4xl mx-auto px-4">
                    Study <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Smarter.</span>
                    <br />
                    Sleep <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Better.</span>
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-8 max-w-2xl text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4">
                    Get premium handwritten notes, curated guides, and summaries so you can study efficiently-and actually get some sleep. Completely free.
                </p>

                {/* Search Engine Wrapper */}
                <div
                    ref={wrapperRef}
                    className="relative mx-auto mt-12 max-w-2xl z-40"
                >
                    <div className="flex overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-slate-100 dark:shadow-none transition-all duration-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                        <div className="flex items-center pl-5 pr-2">
                            <Search size={18} className="text-muted-foreground" />
                        </div>

                        <input
                            value={query}
                            onFocus={() => setShow(true)}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (!results.length) return;

                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setSelected((v) =>
                                        Math.min(v + 1, results.length - 1)
                                    );
                                }

                                if (e.key === "ArrowUp") {
                                    e.preventDefault();
                                    setSelected((v) =>
                                        Math.max(v - 1, 0)
                                    );
                                }

                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    openNote(results[selected]);
                                }

                                if (e.key === "Escape") {
                                    setShow(false);
                                }
                            }}
                            placeholder="Search notes, subjects..."
                            className="flex-1 py-4 px-2 outline-none text-foreground placeholder:text-muted-foreground font-medium text-sm sm:text-base bg-transparent min-w-0"
                        />

                        <button
                            onClick={() => {
                                if (results.length) {
                                    openNote(results[selected]);
                                }
                            }}
                            className="bg-blue-600 px-5 sm:px-8 text-sm font-bold text-white transition-colors duration-200 hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span className="hidden sm:inline">Search</span>
                            <Search className="sm:hidden" size={16} />
                        </button>
                    </div>

                    {/* Results Dropdown */}
                    {show && query && (
                        <div className="absolute z-50 mt-3 max-h-[380px] w-full overflow-auto rounded-2xl border border-border bg-card text-left shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                            {loading && (
                                <div className="p-6 text-center text-muted-foreground font-semibold flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                    Searching database...
                                </div>
                            )}

                            {!loading && results.length === 0 && (
                                <div className="p-6 text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                                    <AlertCircle size={16} className="text-muted-foreground" />
                                    No notes matching query found
                                </div>
                            )}

                            {!loading &&
                                results.map((note, index) => (
                                    <button
                                        key={`${note.subject}-${note.file}`}
                                        onClick={() => openNote(note)}
                                        className={`flex w-full items-center justify-between border-b border-border/60 px-6 py-4.5 text-left transition-colors duration-150 cursor-pointer group ${selected === index
                                                ? "bg-muted text-blue-600 dark:text-blue-400"
                                                : "hover:bg-muted/50 text-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className={`p-2 rounded-xl bg-muted/60 text-muted-foreground ${selected === index ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : ""}`}>
                                                <BookOpen size={16} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                                                    {highlight(note.title)}
                                                </p>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                                                    {note.subject}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className={`text-slate-400 transition-transform duration-200 ${selected === index ? "translate-x-1 text-blue-500" : ""}`} />
                                    </button>
                                ))}
                        </div>
                    )}
                </div>

                {/* Sub-Navigation Buttons */}
                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <a
                        href="#subjects"
                        onClick={scrollToSubjects}
                        className="rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-600/10 hover:shadow-xl hover:shadow-blue-600/20 cursor-pointer flex items-center gap-2"
                    >
                        Browse Subjects
                        <ArrowRight size={16} />
                    </a>

                    <Link
                        href="/admin"
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 px-8 py-4 font-bold text-slate-700 dark:text-slate-350 transition hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                    >
                        Upload Notes
                    </Link>
                </div>
            </div>
        </section>
    );
}
