import PDFViewer from "@/components/notes/PDFViewer";
import ViewerGate from "@/components/viewer/ViewerGate";
import DownloadButton from "@/components/notes/DownloadButton";
import { API_URL } from "@/utils/api";

type Props = {
    params: Promise<{
        semester: string;
        subject: string;
        file: string;
    }>;
};

export default async function ViewPage({
    params,
}: Props) {
    const { semester, subject, file } = await params;

    const response = await fetch(
        `${API_URL}/view/${semester}/${subject}/${file}`,
        {
            cache: "no-store",
        }
    );

    if (!response.ok) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                <h1 className="text-2xl font-bold">
                    Unable to load PDF
                </h1>
            </main>
        );
    }

    const data: {
        thumbnail: string;
        pages: string[];
    } = await response.json();

    const titleDisplay = file
        .replace(".pdf", "")
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

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Header */}
            <div className="border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            {titleDisplay}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            SleepyStudies PDF Viewer
                        </p>
                    </div>

                    <DownloadButton
                        semester={semester}
                        subject={subject}
                        file={file}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 shadow-sm hover:shadow-blue-500/10 cursor-pointer text-sm font-semibold flex items-center justify-center transition-colors duration-150"
                    >
                        Download PDF
                    </DownloadButton>
                </div>
            </div>

            {/* Viewer */}
            <div className="mx-auto max-w-7xl p-8">
                <ViewerGate>
                    <PDFViewer pages={data.pages} />
                </ViewerGate>
            </div>
        </main>
    );
}
