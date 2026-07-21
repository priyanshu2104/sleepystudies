"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    FileText,
    RotateCcw,
} from "lucide-react";
import { API_URL } from "@/utils/api";

type Props = {
    pages: string[];
};

export default function PDFViewer({ pages }: Props) {
    const [page, setPage] = useState(0);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [viewer, setViewer] = useState<{
        name: string;
        id: string;
        viewerId?: string;
    } | null>(null);

    const viewRecorded = useRef(false);

    useEffect(() => {
        const data = localStorage.getItem("viewer");
        if (!data) return;

        const viewer = JSON.parse(data);
        setViewer(viewer);

        if (viewRecorded.current) return;
        viewRecorded.current = true;

        const parts = window.location.pathname.split("/");
        // Path structure: /view/[semester]/[subject]/[file]
        const subjectSlug = parts[3];
        const fileSlug = parts[4];

        if (!subjectSlug || !fileSlug) return;

        fetch(`${API_URL}/view/record`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                viewerId: viewer.viewerId || viewer.id,
                subject: subjectSlug,
                note: decodeURIComponent(fileSlug),
            }),
        }).catch((err) => console.error("Error recording view:", err));
    }, []);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFsChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFsChange);
        };
    }, []);

    useEffect(() => {
        const disableContext = (e: MouseEvent) => e.preventDefault();
        document.addEventListener("contextmenu", disableContext);
        return () => {
            document.removeEventListener("contextmenu", disableContext);
        };
    }, []);

    const toggleFullscreen = () => {
        const el = document.getElementById("pdf-viewer-container");
        if (!el) return;

        if (!document.fullscreenElement) {
            el.requestFullscreen()
                .then(() => setIsFullscreen(true))
                .catch((err) => console.error("Fullscreen error:", err));
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div
            id="pdf-viewer-container"
            className={`overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 flex flex-col ${
                isFullscreen ? "h-screen w-screen rounded-none border-none" : ""
            }`}
        >
            {/* Toolbar Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        className="rounded-xl border border-slate-800 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        title="Previous Page"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold text-slate-300">
                        Page {page + 1} / {pages.length}
                    </span>
                    <button
                        disabled={page === pages.length - 1}
                        onClick={() => setPage(page + 1)}
                        className="rounded-xl border border-slate-800 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                        title="Next Page"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="text-center hidden sm:block">
                    <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">
                        Secure PDF Sandbox
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Protected by SleepyStudies Watermark
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleFullscreen}
                        className="rounded-xl border border-slate-800 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                </div>
            </div>

            {/* Viewer Workspace */}
            <div className="flex-1 flex justify-center overflow-auto bg-slate-950 p-8 select-none relative custom-scrollbar">
                <div
                    className="relative select-none flex-shrink-0"
                    style={{
                        width: `${zoom}%`,
                        maxWidth: "1200px",
                        minWidth: "320px",
                        transition: "width 0.15s ease-out",
                    }}
                >
                    <Image
                        src={pages[page]}
                        alt={`PDF Page ${page + 1}`}
                        width={1000}
                        height={1400}
                        draggable={false}
                        unoptimized
                        className="rounded-xl shadow-2xl border border-slate-800 select-none pointer-events-none w-full h-auto"
                    />

                    {/* WATERMARK LAYER */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
                        {Array.from({ length: 16 }).map((_, index) => (
                            <div
                                key={index}
                                className="absolute font-semibold text-slate-800/10 pointer-events-none select-none text-center leading-relaxed"
                                style={{
                                    top: `${Math.floor(index / 4) * 25 + 8}%`,
                                    left: `${(index % 4) * 25 + 4}%`,
                                    transform: "rotate(-35deg)",
                                    fontSize: "12px",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <div className="font-bold tracking-widest text-[14px] text-white/10">SLEEPYSTUDIES</div>
                                <div className="uppercase tracking-wider text-[11px] mt-0.5">{viewer?.name || "STUDENT"}</div>
                                <div className="font-mono text-[9px] opacity-80">{viewer?.viewerId || viewer?.id || "GUEST-ID"}</div>
                                <div className="text-[9px] tracking-wide mt-0.5 font-bold">EDUCATIONAL USE ONLY</div>
                                <div className="text-[9px] opacity-75">
                                    {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Controls / Zoom Bar */}
            <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900 px-6 py-4 flex-shrink-0 text-slate-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setZoom(100)}
                        className="rounded-xl border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white cursor-pointer"
                        title="Reset Zoom"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <span className="text-sm font-semibold text-slate-400">
                        {zoom}%
                    </span>
                </div>

                {/* Range Zoom Slider */}
                <div className="flex items-center gap-4 flex-1 max-w-xs mx-6">
                    <button
                        onClick={() => setZoom((z) => Math.max(50, z - 10))}
                        className="text-slate-400 hover:text-white transition cursor-pointer"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                    />
                    <button
                        onClick={() => setZoom((z) => Math.min(200, z + 10))}
                        className="text-slate-400 hover:text-white transition cursor-pointer"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>

                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:block">
                    Encrypted Stream
                </div>
            </div>
        </div>
    );
}