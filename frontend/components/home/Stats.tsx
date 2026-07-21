"use client";

import { useEffect, useState } from "react";
import { BookOpen, Award, Download, Eye } from "lucide-react";
import { API_URL } from "@/utils/api";

type StatsData = {
    subjects: number;
    notes: number;
    views: number;
    downloads: number;
};

export default function Stats() {
    const [stats, setStats] = useState<StatsData>({
        subjects: 0,
        notes: 0,
        views: 0,
        downloads: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`${API_URL}/notes/overall-stats`, {
                    cache: "no-store",
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch overall stats:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <section className="bg-blue-600 dark:bg-blue-750 py-20 text-white relative overflow-hidden transition-colors duration-300">
            {/* Background Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-10" />
            <div className="absolute top-1/2 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 opacity-10" />

            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Notes stat */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition duration-200">
                        <div className="rounded-2xl bg-white/10 p-3 mb-4 flex items-center justify-center">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            {loading ? "..." : `${stats.notes}`}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                            Total Notes
                        </p>
                    </div>

                    {/* Subjects stat */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition duration-200">
                        <div className="rounded-2xl bg-white/10 p-3 mb-4 flex items-center justify-center">
                            <Award size={24} />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            {loading ? "..." : `${stats.subjects}`}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                            Subjects
                        </p>
                    </div>

                    {/* Views stat */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition duration-200">
                        <div className="rounded-2xl bg-white/10 p-3 mb-4 flex items-center justify-center">
                            <Eye size={24} />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            {loading ? "..." : `${stats.views}`}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                            Total Views
                        </p>
                    </div>

                    {/* Downloads stat */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-sm hover:bg-white/10 transition duration-200">
                        <div className="rounded-2xl bg-white/10 p-3 mb-4 flex items-center justify-center">
                            <Download size={24} />
                        </div>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            {loading ? "..." : `${stats.downloads}`}
                        </h2>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
                            Downloads
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}