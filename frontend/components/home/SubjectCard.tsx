import Link from "next/link";
import {
    Database,
    Binary,
    ChevronRight,
    ArrowUpRight,
    Brain,
    Cpu,
    Terminal,
    Shield,
    Cloud,
    Server,
    Network,
    GitBranch
} from "lucide-react";

type Props = {
    title: string;
    slug: string;
    notes: number;
    semester: string;
};

function getSubjectTheme(slug: string) {
    const s = slug.toLowerCase();
    
    // 1. Artificial Intelligence
    if (s.includes("artificial-intelligence") || s.includes("ai")) {
        return {
            icon: <Brain size={24} />,
            bg: "bg-indigo-50/80 border border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30",
            color: "text-indigo-600 dark:text-indigo-400",
            gradient: "from-indigo-500/10 to-transparent",
            shadow: "hover:shadow-indigo-500/5",
        };
    }
    
    // 2. Compiler Design
    if (s.includes("compiler")) {
        return {
            icon: <Terminal size={24} />,
            bg: "bg-rose-50/80 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30",
            color: "text-rose-600 dark:text-rose-400",
            gradient: "from-rose-500/10 to-transparent",
            shadow: "hover:shadow-rose-500/5",
        };
    }

    // 3. Data Communication and Computer Networks
    if (s.includes("network") || s.includes("communication")) {
        return {
            icon: <Network size={24} />,
            bg: "bg-cyan-50/80 border border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30",
            color: "text-cyan-600 dark:text-cyan-400",
            gradient: "from-cyan-500/10 to-transparent",
            shadow: "hover:shadow-cyan-500/5",
        };
    }

    // 4. Data Mining Concepts and Techniques
    if (s.includes("mining")) {
        return {
            icon: <Database size={24} />,
            bg: "bg-blue-50/80 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30",
            color: "text-blue-600 dark:text-blue-400",
            gradient: "from-blue-500/10 to-transparent",
            shadow: "hover:shadow-blue-500/5",
        };
    }

    // 5. Software Engineering
    if (s.includes("software") || s.includes("engineering")) {
        return {
            icon: <GitBranch size={24} />,
            bg: "bg-emerald-50/80 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30",
            color: "text-emerald-600 dark:text-emerald-400",
            gradient: "from-emerald-500/10 to-transparent",
            shadow: "hover:shadow-emerald-500/5",
        };
    }

    // Fallbacks for other topics
    if (s.includes("dbms") || s.includes("database") || s.includes("sql")) {
        return {
            icon: <Database size={24} />,
            bg: "bg-blue-50/80 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30",
            color: "text-blue-600 dark:text-blue-400",
            gradient: "from-blue-500/10 to-transparent",
            shadow: "hover:shadow-blue-500/5",
        };
    }

    if (s.includes("os") || s.includes("operating") || s.includes("system") || s.includes("hardware") || s.includes("cpu")) {
        return {
            icon: <Cpu size={24} />,
            bg: "bg-emerald-50/80 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30",
            color: "text-emerald-600 dark:text-emerald-400",
            gradient: "from-emerald-500/10 to-transparent",
            shadow: "hover:shadow-emerald-500/5",
        };
    }

    if (s.includes("security") || s.includes("crypt") || s.includes("cyber") || s.includes("lock")) {
        return {
            icon: <Shield size={24} />,
            bg: "bg-teal-50/80 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/30",
            color: "text-teal-600 dark:text-teal-400",
            gradient: "from-teal-500/10 to-transparent",
            shadow: "hover:shadow-teal-500/5",
        };
    }

    if (s.includes("structure") || s.includes("algorithm") || s.includes("math") || s.includes("binary") || s.includes("discrete")) {
        return {
            icon: <Binary size={24} />,
            bg: "bg-violet-50/80 border border-violet-100 dark:bg-violet-950/20 dark:border-violet-900/30",
            color: "text-violet-600 dark:text-violet-400",
            gradient: "from-violet-500/10 to-transparent",
            shadow: "hover:shadow-violet-500/5",
        };
    }

    // Default Fallback Theme (Computer Science Generic)
    return {
        icon: <Server size={24} />,
        bg: "bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-700/30",
        color: "text-slate-600 dark:text-slate-400",
        gradient: "from-slate-500/10 to-transparent",
        shadow: "hover:shadow-slate-500/5",
    };
}

export default function SubjectCard({
    title,
    slug,
    notes,
    semester,
}: Props) {
    const theme = getSubjectTheme(slug);

    return (
        <Link href={`/subject/${semester}/${slug}`} className="block group h-full">
            <div className={`relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${theme.shadow} hover:border-slate-300 dark:hover:border-slate-700 flex flex-col h-full justify-between`}>
                {/* Accent Corner Gradient */}
                <div className={`absolute -right-16 -top-16 h-36 w-36 rounded-full bg-gradient-to-br ${theme.gradient} blur-2xl transition-all duration-300 group-hover:scale-150`} />

                <div>
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                        <div className={`inline-flex rounded-2xl p-3.5 ${theme.bg}`}>
                            <div className={theme.color}>
                                {theme.icon}
                            </div>
                        </div>
                        <div className="rounded-full bg-slate-50 dark:bg-slate-800 p-2 text-slate-400 dark:text-slate-500 opacity-0 transition-all duration-300 group-hover:translate-x-[-4px] group-hover:translate-y-[4px] group-hover:opacity-100 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="mt-8 text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {title}
                    </h3>

                    <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
                        {notes} {notes === 1 ? "Note" : "Notes"} available
                    </p>
                </div>

                {/* Footer Divider & Action */}
                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-sm font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    <span className="flex items-center text-slate-400 dark:text-slate-500 group-hover:text-blue-500/80 dark:group-hover:text-blue-400/80 transition-colors">
                        ⭐ Updated Recently
                    </span>
                    <span className="flex items-center gap-1">
                        Explore
                        <ChevronRight
                            className="transition duration-200 group-hover:translate-x-1"
                            size={16}
                        />
                    </span>
                </div>
            </div>
        </Link>
    );
}