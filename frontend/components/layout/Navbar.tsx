"use client";

import Link from "next/link";
import { BookOpen, Menu, ArrowRight, Sun, Moon } from "lucide-react";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "react";
import { useScrollToSubjects } from "@/utils/scrollHelper";

export default function Navbar() {
    const scrollToSubjects = useScrollToSubjects();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme");
        const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const initial = saved === "dark" || saved === "light" ? saved : system;
        
        setTheme(initial);
        if (initial === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const handleHomeClick = (e: React.MouseEvent) => {
        if (window.location.pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (window.location.search) {
                window.history.pushState({}, "", "/");
            }
        }
    };

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        if (next === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
                {/* Logo & Brand */}
                <Link
                    href="/"
                    onClick={handleHomeClick}
                    className="flex items-center gap-3.5 hover:opacity-90 transition-opacity duration-200"
                >
                    <div className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 shadow-md shadow-blue-500/10 flex items-center justify-center">
                        <BookOpen
                            className="text-white"
                            size={18}
                        />
                    </div>
                    <div>
                        <h1 className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                            SleepyStudies
                        </h1>
                        <p className="hidden sm:block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                            Study Smarter, Sleep Better
                        </p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Link
                        href="/"
                        onClick={handleHomeClick}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        Home
                    </Link>
                    <a
                        href="/#subjects"
                        onClick={scrollToSubjects}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                        Subjects
                    </a>
                    <Link href="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Upload
                    </Link>
                </nav>

                {/* Search & Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:block w-72">
                        <SearchBar />
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    >
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <Link
                        href="/#subjects"
                        className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-50 px-5 py-3 text-xs font-bold text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm cursor-pointer"
                    >
                        Browse
                        <ArrowRight size={14} />
                    </Link>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 p-2.5 text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white md:hidden cursor-pointer"
                    >
                        <Menu size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 px-6 py-5 flex flex-col gap-4 shadow-lg">
                    <Link 
                        href="/" 
                        onClick={(e) => {
                            setIsOpen(false);
                            handleHomeClick(e);
                        }}
                        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5"
                    >
                        Home
                    </Link>
                    <a
                        href="/#subjects"
                        onClick={(e) => {
                            setIsOpen(false);
                            scrollToSubjects(e);
                        }}
                        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5 cursor-pointer"
                    >
                        Subjects
                    </a>
                    <Link 
                        href="/admin" 
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1.5"
                    >
                        Upload
                    </Link>
                    
                    {/* Mobile Search Bar */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <SearchBar />
                    </div>
                </div>
            )}
        </header>
    );
}