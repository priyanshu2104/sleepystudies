"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, CheckCircle2, AlertTriangle, Key, Plus, Trash2, FolderPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/utils/api";

type Subject = {
    slug: string;
    title: string;
    notes: number;
};

type Semester = {
    semester: string;
    slug: string;
    subjects: Subject[];
};

export default function AdminPage() {
    const [semesters, setSemesters] = useState<Semester[]>([]);
    
    const [selectedSemester, setSelectedSemester] = useState("");
    const [isCreatingNewSemester, setIsCreatingNewSemester] = useState(false);
    const [newSemesterName, setNewSemesterName] = useState("");

    const [selectedSubject, setSelectedSubject] = useState("");
    const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");
    
    const [title, setTitle] = useState("");
    const [passcode, setPasscode] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{
        type: "success" | "error" | null;
        message: string;
    }>({ type: null, message: "" });

    // Load passcode from sessionStorage on mount
    useEffect(() => {
        const cached = sessionStorage.getItem("admin_passcode");
        if (cached) {
            setPasscode(cached);
        }

        // Fetch semesters dynamically
        async function loadSemesters() {
            try {
                const res = await fetch(`${API_URL}/notes`);
                if (res.ok) {
                    const data = await res.json();
                    setSemesters(data);
                    if (data.length > 0) {
                        setSelectedSemester(data[0].slug);
                    }
                }
            } catch (err) {
                console.error("Failed to load semesters dynamically", err);
            }
        }
        loadSemesters();
    }, []);

    // Cascade dropdown: update subject dropdown when active semester changes
    useEffect(() => {
        if (!selectedSemester) return;
        const activeSemester = semesters.find(sem => sem.slug === selectedSemester);
        if (activeSemester && activeSemester.subjects.length > 0) {
            setSelectedSubject(activeSemester.subjects[0].slug);
        } else {
            setSelectedSubject("");
        }
    }, [selectedSemester, semesters]);

    // Drag-and-drop Handlers
    function handleDrag(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    }

    // Client-side validation: Max 50MB and only PDF files
    function validateAndSetFile(selectedFile: File) {
        setStatus({ type: null, message: "" });

        if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
            setStatus({
                type: "error",
                message: "Invalid file type. Please upload a PDF document.",
            });
            return;
        }

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (selectedFile.size > maxSize) {
            setStatus({
                type: "error",
                message: `File is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 50MB.`,
            });
            return;
        }

        setFile(selectedFile);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title.trim()) {
            setStatus({ type: "error", message: "Please enter a note title." });
            return;
        }

        const targetSemester = isCreatingNewSemester ? newSemesterName.trim() : selectedSemester;
        if (!targetSemester) {
            setStatus({ type: "error", message: "Please select or enter a semester." });
            return;
        }

        const targetSubject = (isCreatingNewSubject || isCreatingNewSemester) ? newSubjectName.trim() : selectedSubject;
        if (!targetSubject) {
            setStatus({ type: "error", message: "Please select or enter a subject." });
            return;
        }

        if (!passcode.trim()) {
            setStatus({ type: "error", message: "Please enter the admin passcode." });
            return;
        }

        if (!file) {
            setStatus({ type: "error", message: "Please select a PDF file to upload." });
            return;
        }

        setLoading(true);
        setProgress(10);
        setStatus({ type: null, message: "" });

        const formData = new FormData();
        formData.append("semester", targetSemester);
        formData.append("subject", targetSubject);
        formData.append("title", title);
        formData.append("file", file);

        // Simulate progress bar smooth updates
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 10;
            });
        }, 150);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: {
                    "x-admin-passcode": passcode,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to upload note.");
            }

            // Save passcode in sessionStorage on success
            sessionStorage.setItem("admin_passcode", passcode);

            setStatus({
                type: "success",
                message: `Note "${data.note.title}" uploaded successfully to "${data.note.semester} / ${data.note.subject}"!`,
            });
            setTitle("");
            setFile(null);
            setNewSubjectName("");
            setNewSemesterName("");
            setIsCreatingNewSubject(false);
            setIsCreatingNewSemester(false);

            // Refetch semesters to dynamically update list
            const refreshRes = await fetch(`${API_URL}/notes`);
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setSemesters(refreshData);
            }

            // Reset the file input field
            const fileInput = document.getElementById("file-input") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (err: any) {
            clearInterval(progressInterval);
            setProgress(0);
            setStatus({
                type: "error",
                message: err.message || "Something went wrong during upload.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-6 transition-colors duration-300">
            <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100 dark:shadow-none">
                
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-6 text-sm font-semibold transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    Upload Study Notes
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                    Add new handwritten guides, PDFs, or lecture notes directly to the dynamic storage catalog.
                </p>

                {status.type && (
                    <div
                        className={`p-4 rounded-2xl mb-6 text-sm font-semibold flex items-start gap-3 border ${
                            status.type === "success"
                                ? "bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/10"
                                : "bg-red-50 dark:bg-red-500/5 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/10"
                        }`}
                    >
                        {status.type === "success" ? (
                            <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
                        ) : (
                            <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        )}
                        <span>{status.message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Semester field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                Semester Group
                            </label>
                            
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewSemester(!isCreatingNewSemester);
                                    setStatus({ type: null, message: "" });
                                }}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                            >
                                {isCreatingNewSemester ? (
                                    <>
                                        <ArrowLeft size={12} />
                                        Select Existing
                                    </>
                                ) : (
                                    <>
                                        <Plus size={12} />
                                        Create New Semester
                                    </>
                                )}
                            </button>
                        </div>

                        {isCreatingNewSemester ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newSemesterName}
                                    onChange={(e) => setNewSemesterName(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 pl-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold"
                                    placeholder="e.g. Semester 5"
                                    required
                                />
                                <FolderPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        ) : (
                            <select
                                value={selectedSemester}
                                onChange={(e) => setSelectedSemester(e.target.value)}
                                className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold cursor-pointer"
                            >
                                {semesters.length === 0 ? (
                                    <option value="semester-5">Semester 5</option>
                                ) : (
                                    semesters.map((sem) => (
                                        <option key={sem.slug} value={sem.slug}>
                                            {sem.semester}
                                        </option>
                                    ))
                                )}
                            </select>
                        )}
                    </div>

                    {/* Subject field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                Subject Group
                            </label>
                            
                            {!isCreatingNewSemester && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingNewSubject(!isCreatingNewSubject);
                                        setStatus({ type: null, message: "" });
                                    }}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                                >
                                    {isCreatingNewSubject ? (
                                        <>
                                            <ArrowLeft size={12} />
                                            Select Existing
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={12} />
                                            Create New Subject
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {(isCreatingNewSubject || isCreatingNewSemester) ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 pl-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold"
                                    placeholder="e.g. Operating Systems"
                                    required
                                />
                                <FolderPlus size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        ) : (
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold cursor-pointer"
                            >
                                {(() => {
                                    const activeSemester = semesters.find(sem => sem.slug === selectedSemester);
                                    if (!activeSemester || activeSemester.subjects.length === 0) {
                                        return <option value="">No subjects in this semester</option>;
                                    }
                                    return activeSemester.subjects.map((sub) => (
                                        <option key={sub.slug} value={sub.slug}>
                                            {sub.title}
                                        </option>
                                    ));
                                })()}
                            </select>
                        )}
                    </div>

                    {/* Note title */}
                    <div>
                        <label className="block mb-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                            Note Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold"
                            placeholder="e.g. Memory Management Unit 2"
                            required
                        />
                    </div>

                    {/* Admin passcode */}
                    <div>
                        <label className="block mb-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                            Admin Passcode
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                                className="border border-slate-200 dark:border-slate-800 rounded-xl w-full p-4 pl-12 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition font-semibold"
                                placeholder="••••••••"
                                required
                            />
                            <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {/* Drag-and-drop zone */}
                    <div>
                        <label className="block mb-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                            Document Upload (PDF)
                        </label>
                        
                        {!file ? (
                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition ${
                                    dragActive
                                        ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    required
                                />
                                
                                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                                    <Upload size={28} />
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 font-bold mb-1">
                                    Drag and drop your PDF here
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-4">
                                    or click to upload from local storage
                                </p>
                                <button
                                    type="button"
                                    onClick={() => document.getElementById("file-input")?.click()}
                                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                                >
                                    Choose File
                                </button>
                            </div>
                        ) : (
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="shrink-0 rounded-xl bg-red-100 dark:bg-red-500/10 p-3 text-red-600 dark:text-red-400 flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                                            {file.name}
                                        </p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFile(null);
                                        const fileInput = document.getElementById("file-input") as HTMLInputElement;
                                        if (fileInput) fileInput.value = "";
                                    }}
                                    className="shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
                                    title="Remove document"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Uploading note assets...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition duration-200 disabled:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 cursor-pointer flex items-center justify-center shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20"
                    >
                        {loading ? "Uploading to Catalog..." : "Upload PDF Note"}
                    </button>
                </form>
            </div>
        </main>
    );
}