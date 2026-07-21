"use client";

import Link from "next/link";
import { Eye, Download, FileText } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import DownloadButton from "@/components/notes/DownloadButton";

type Props = {
    title: string;
    file: string;
    subject: string;
    semester: string;
    thumbnail?: string | null;
    views?: number;
    downloads?: number;
};

export default function NoteCard({
    title,
    file,
    subject,
    semester,
    thumbnail,
    views = 0,
    downloads = 0,
}: Props) {
    const [imgError, setImgError] = useState(false);

    const subjectDisplay = subject
        .replace(/-/g, " ")
        .toUpperCase();

    return (
        <div className="group overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-slate-350 dark:hover:border-slate-700 flex flex-col h-full">
            {/* Thumbnail Wrapper with Zoom and Overlay */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-850 flex-shrink-0 flex items-center justify-center">
                {!imgError && thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImgError(true)}
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-400 dark:text-slate-500">
                        <FileText size={48} className="text-slate-300 dark:text-slate-800 animate-pulse" />
                        <span className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Preview Not Available
                        </span>
                    </div>
                )}
                {/* Visual Glassmorphic Accent Badge */}
                <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white border border-white/10 shadow-sm">
                    <FileText size={12} />
                    PDF
                </span>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-450">
                        {subjectDisplay}
                    </span>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" title={title}>
                        {title}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">
                        Verified Student Notes
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg">
                            <Eye size={14} className="text-slate-400" />
                            {views} {views === 1 ? "view" : "views"}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg">
                            <Download size={14} className="text-slate-400" />
                            {downloads} {downloads === 1 ? "download" : "downloads"}
                        </span>
                    </div>
                </div>

                {/* Actions Button Grid */}
                <div className="mt-8 flex gap-3 flex-shrink-0">
                    <Link
                        href={`/view/${semester}/${subject}/${file}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 shadow-sm hover:shadow-blue-500/10 cursor-pointer"
                    >
                        <Eye size={16} />
                        View
                    </Link>

                    <DownloadButton
                        semester={semester}
                        subject={subject}
                        file={file}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 py-3.5 px-4 text-sm font-semibold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
                    >
                        <Download size={16} />
                        Download
                    </DownloadButton>
                </div>
            </div>
        </div>
    );
}