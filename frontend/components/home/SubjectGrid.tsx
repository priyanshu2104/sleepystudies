"use client";

import { useEffect, useState } from "react";
import SubjectCard from "./SubjectCard";
import { BookOpen } from "lucide-react";
import { API_URL } from "@/utils/api";

type Subject = {
    title: string;
    slug: string;
    notes: number;
    updatedAt?: number;
};

type Semester = {
    semester: string;
    slug: string;
    subjects: Subject[];
};

export default function SubjectGrid() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [activeTab, setActiveTab] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchSemesters() {
            try {
                const res = await fetch(`${API_URL}/notes`, {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    setSemesters(data);
                    if (data.length > 0) {
                        setActiveTab(data[0].slug);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (!loading && semesters.length > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            const isScrollReq = urlParams.get("scroll") === "subjects" || window.location.hash === "#subjects";
            if (isScrollReq) {
                setTimeout(() => {
                    const element = document.getElementById("subjects");
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }, 100);
            }
        }
    }, [loading, semesters]);

    const activeSemester = semesters.find(sem => sem.slug === activeTab);

    return (
        <section
            id="subjects"
            className="relative mx-auto max-w-7xl px-6 py-24 scroll-mt-16"
        >
            {/* Grid Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="mb-12 text-center">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    Browse by Semester
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400 font-medium">
                    Select a semester to browse through its lecture notes and study guides.
                </p>
                <div className="mx-auto mt-6 h-1 w-12 rounded-full bg-blue-600" />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading semesters...</p>
                </div>
            ) : semesters.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed bg-white/50 dark:bg-slate-900/50 p-12 text-center">
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">No semesters found.</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Add notes inside pdfs/semester-name/subject-name/ folder structure to index them.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {/* Semester Tabs Panel */}
                    <div className="flex flex-wrap justify-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-6">
                        {semesters.map((sem) => (
                            <button
                                key={sem.slug}
                                onClick={() => setActiveTab(sem.slug)}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                                    activeTab === sem.slug
                                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                <BookOpen size={16} />
                                {sem.semester}
                            </button>
                        ))}
                    </div>

                    {/* Active Semester Subjects Grid */}
                    {activeSemester && (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeSemester.subjects.map((subject) => (
                                <SubjectCard
                                    key={subject.slug}
                                    title={subject.title}
                                    slug={subject.slug}
                                    notes={subject.notes}
                                    semester={activeSemester.slug}
                                    updatedAt={subject.updatedAt}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}