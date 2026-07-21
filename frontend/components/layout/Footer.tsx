"use client";

import Link from "next/link";
import { BookOpen, Mail, Shield } from "lucide-react";
import { useScrollToSubjects } from "@/utils/scrollHelper";

interface GithubIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
}

function GithubIcon({ size = 24, ...props }: GithubIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width={size}
            height={size}
            {...props}
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-3" />
        </svg>
    );
}

export default function Footer() {
    const scrollToSubjects = useScrollToSubjects();
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-20">
            {/* Top Footer Section */}
            <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5 relative">
                {/* Brand Column */}
                <div className="lg:col-span-3 space-y-6">
                    <Link href="/" className="flex items-center gap-3.5 hover:opacity-90 transition-opacity">
                        <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 shadow-md shadow-blue-500/10 flex items-center justify-center">
                            <BookOpen className="text-white" size={18} />
                        </div>
                        <span className="text-[17px] font-extrabold tracking-tight text-white">
                            SleepyStudies
                        </span>
                    </Link>
                    <p className="text-slate-400 font-medium max-w-md text-sm leading-relaxed">
                        An open-source secure notes repository curated for computer science students to collaborate, share guides, and sleep better.
                    </p>
                    <div className="flex items-center gap-4 text-slate-500">
                        <a href="https://github.com/priyanshu2104" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="GitHub">
                            <GithubIcon size={20} />
                        </a>
                        <a href="mailto:priyanshu210408@gmail.com" className="hover:text-white transition-colors" title="Email Support">
                            <Mail size={20} />
                        </a>
                        <a href="/privacy" className="hover:text-white transition-colors" title="Security & Privacy">
                            <Shield size={20} />
                        </a>
                    </div>
                </div>

                {/* Subjects Column */}
                <div>
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest">
                        Subjects
                    </h4>
                    <ul className="mt-5 space-y-3.5 text-sm font-semibold">
                        <li>
                            <Link href="/subject/semester-5/compiler-design" className="hover:text-white transition-colors">Compiler Design</Link>
                        </li>
                        <li>
                            <Link href="/subject/semester-5/artificial-intelligence" className="hover:text-white transition-colors">Artificial Intelligence</Link>
                        </li>
                        <li>
                            <Link href="/subject/semester-5/software-engineering" className="hover:text-white transition-colors">Software Engineering</Link>
                        </li>
                        <li>
                            <a
                                href="/#subjects"
                                onClick={scrollToSubjects}
                                className="text-blue-400 hover:text-blue-300 transition-colors font-bold cursor-pointer"
                            >
                                All Subjects
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Platform Column */}
                <div>
                    <h4 className="text-white font-bold text-xs uppercase tracking-widest">
                        Admin
                    </h4>
                    <ul className="mt-5 space-y-3.5 text-sm font-semibold">
                        <li>
                            <Link href="/admin" className="hover:text-white transition-colors">Upload Notes</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-800 bg-slate-950/40 py-8 text-xs font-semibold text-slate-500">
                <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <p>© 2026 SleepyStudies. Built with ♥ by <a href="https://www.linkedin.com/in/priyanshushekhar04/" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Priyanshu Shekhar</a>.</p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            All Systems Operational
                        </div>
                        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}