"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/api";

type Result = {
    title: string;
    file: string;
    subject: string;
    semester: string;
};

export default function SearchBar() {
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [selected, setSelected] = useState(0);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Live Search
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

    // Close on outside click
    useEffect(() => {

        function outside(event: MouseEvent) {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
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

        const regex = new RegExp(`(${query})`, "gi");

        return text.split(regex).map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span
                    key={index}
                    className="font-bold text-blue-600"
                >
                    {part}
                </span>
            ) : (
                part
            )
        );

    }

    return (
        <div
            ref={wrapperRef}
            className="relative w-full max-w-2xl"
        >

            {/* Search Box */}

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow">

                <Search
                    className="ml-4 text-slate-500 dark:text-slate-400"
                    size={20}
                />

                <input
                    value={query}
                    placeholder="Search notes..."
                    className="w-full px-4 py-4 outline-none bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400"
                    onFocus={() => setShow(true)}
                    onChange={(e) =>
                        setQuery(e.target.value)
                    }
                    onKeyDown={(e) => {

                        if (!results.length) return;

                        if (e.key === "ArrowDown") {

                            e.preventDefault();

                            setSelected((prev) =>
                                Math.min(
                                    prev + 1,
                                    results.length - 1
                                )
                            );

                        }

                        if (e.key === "ArrowUp") {

                            e.preventDefault();

                            setSelected((prev) =>
                                Math.max(prev - 1, 0)
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
                />

            </div>

            {/* Dropdown */}

            {show && query && (

                <div className="absolute z-50 mt-2 max-h-[380px] w-full overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl text-slate-900 dark:text-white custom-scrollbar">

                    {loading && (

                        <div className="p-5 text-center text-slate-500 dark:text-slate-400">

                            Searching...

                        </div>

                    )}

                    {!loading && results.length === 0 && (

                        <div className="p-5 text-center text-slate-500 dark:text-slate-400">

                            No notes found

                        </div>

                    )}

                    {results.map((note, index) => (

                        <button
                            key={`${note.subject}-${note.file}`}
                            onClick={() =>
                                openNote(note)
                            }
                            className={`flex w-full items-center justify-between px-5 py-4 text-left transition

                                ${index === selected
                                    ? "bg-blue-50/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-white"
                                }`}
                        >

                            <div>

                                <p className="font-semibold text-slate-900 dark:text-slate-100">

                                    {highlight(note.title)}

                                </p>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">

                                    {note.subject}

                                </p>

                            </div>

                        </button>

                    ))}

                </div>

            )}

        </div>
    );
}