"use client";

import { useState } from "react";
import { API_URL } from "@/utils/api";

type Props = {
    semester: string;
    subject: string;
    file: string;
    className?: string;
    children: React.ReactNode;
};

export default function DownloadButton({
    semester,
    subject,
    file,
    className = "",
    children,
}: Props) {
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const triggerDownload = (viewerId: string) => {
        window.location.href = `${API_URL}/download/${semester}/${subject}/${file}?viewerId=${viewerId}`;
    };

    const handleDownloadClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const stored = localStorage.getItem("viewer");
        if (stored) {
            try {
                const viewer = JSON.parse(stored);
                if (viewer.viewerId || viewer.id) {
                    triggerDownload(viewer.viewerId || viewer.id);
                    return;
                }
            } catch (err) {
                console.error("Error parsing viewer info:", err);
            }
        }
        // If no valid viewer found, open the prompt modal
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/viewer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!res.ok) {
                throw new Error("Failed to register viewer");
            }

            const data = await res.json();
            const viewer = {
                name: data.name,
                viewerId: data.viewerId,
                id: data.viewerId,
                createdAt: data.firstVisit || new Date().toISOString(),
            };

            localStorage.setItem("viewer", JSON.stringify(viewer));
            setShowModal(false);
            triggerDownload(viewer.viewerId);
        } catch (err) {
            console.error("Download gate registration error:", err);
            // Local fallback in case backend is offline
            const fallbackId = crypto.randomUUID().slice(0, 8).toUpperCase();
            const viewer = {
                name: name.trim(),
                viewerId: fallbackId,
                id: fallbackId,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem("viewer", JSON.stringify(viewer));
            setShowModal(false);
            triggerDownload(fallbackId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleDownloadClick} className={className}>
                {children}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl relative">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Download Notes
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Enter your name once to download this PDF file.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                                disabled={loading}
                            />

                            {error && (
                                <p className="mt-2 text-xs text-red-500">
                                    {error}
                                </p>
                            )}

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : "Continue & Download"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
