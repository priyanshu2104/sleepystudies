import NoteCard from "@/components/notes/NoteCard";
import Link from "next/link";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import { API_URL } from "@/utils/api";

type Note = {
    title: string;
    file: string;
    thumbnail?: string | null;
    views?: number;
    downloads?: number;
};

async function getNotes(semester: string, slug: string) {
    try {
        const res = await fetch(
            `${API_URL}/notes/${semester}/${slug}`,
            {
                cache: "no-store",
            }
        );

        if (!res.ok) return [];

        return res.json();
    } catch (err) {
        console.error("Failed to fetch notes:", err);
        return [];
    }
}

export default async function SubjectPage({
    params,
}: {
    params: Promise<{ semester: string; slug: string }>;
}) {
    const { semester, slug } = await params;

    const notes = await getNotes(semester, slug);

    const title = slug
        .replace(/-/g, " ")
        .split(" ")
        .map(word => {
            const upper = word.toUpperCase();
            if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)$/i.test(word)) {
                return upper;
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");

    const semesterDisplay = semester
        .replace(/-/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Header section with back button */}
            <div className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-8 px-6">
                <div className="mx-auto max-w-7xl">
                    <Link
                        href="/#subjects"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition duration-200"
                    >
                        <ArrowLeft size={16} />
                        Back to Semesters
                    </Link>

                    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-450 bg-blue-50 dark:bg-blue-950/30 px-3 py-1 rounded-full">
                                {semesterDisplay}
                            </span>
                            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                                {title}
                            </h1>
                            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">
                                Browse lecture notes, slides, and exam preparation documents.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes Grid */}
            <section className="mx-auto max-w-7xl px-6 py-12">
                {notes.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed bg-white/50 dark:bg-slate-900/50 p-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-6">
                            <FileText size={28} />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                            No notes uploaded yet
                        </h3>
                        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                            We couldn't find any PDF documents in the <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">pdfs/{semester}/{slug}/</code> directory.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {notes.map((note: Note) => (
                            <NoteCard
                                key={note.file}
                                title={note.title}
                                file={note.file}
                                subject={slug}
                                semester={semester}
                                thumbnail={note.thumbnail}
                                views={note.views}
                                downloads={note.downloads}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
