import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Download } from "lucide-react";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 py-16 px-6">
            <div className="mx-auto max-w-3xl">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-12"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="rounded-2xl bg-blue-600/10 p-3.5 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            Last updated: July 2026
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 p-8 md:p-12 shadow-xl shadow-slate-100/50 dark:shadow-none">
                    
                    {/* Introduction */}
                    <section className="space-y-4">
                        <p className="leading-relaxed font-medium">
                            At <strong>SleepyStudies</strong>, we are committed to being transparent about how we collect and use your data. This Privacy Policy explains our practices when you access, view, or download notes from our repository.
                        </p>
                    </section>

                    <hr className="border-slate-150 dark:border-slate-800" />

                    {/* Information We Collect */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Lock className="text-blue-600 dark:text-blue-400" size={22} />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                1. Information We Collect
                            </h2>
                        </div>
                        <p className="leading-relaxed">
                            To protect our content from automated scraping, prevent service abuse, and provide accurate stats, we collect the following limited information:
                        </p>
                        <ul className="space-y-3.5 pl-5 list-disc">
                            <li className="leading-relaxed">
                                <strong>Your Name:</strong> Collected when you view or download notes for the first time. This name is used to generate safety watermarks on documents and identify activity logs.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Technical Diagnostics:</strong> IP address, browser type (User-Agent), and timestamps of requests to prevent DDoS attacks and rate limit downloads.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Usage Metrics:</strong> Logs of which note files you view and download to maintain real-time catalog statistics.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-slate-150 dark:border-slate-800" />

                    {/* How We Use Your Data */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Eye className="text-blue-600 dark:text-blue-400" size={22} />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                2. How We Use Your Data
                            </h2>
                        </div>
                        <p className="leading-relaxed">
                            We use the collected information solely for the following purposes:
                        </p>
                        <ul className="space-y-3.5 pl-5 list-disc">
                            <li className="leading-relaxed">
                                To render personalized, secure watermarks inside our PDF sandboxes.
                            </li>
                            <li className="leading-relaxed">
                                To generate dynamic, real-time counters (total views & downloads) displayed on subject lists and note cards.
                            </li>
                            <li className="leading-relaxed">
                                To secure the database and prevent unauthorized downloads or bulk scraping of educational resources.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-slate-150 dark:border-slate-800" />

                    {/* Data Security & Sharing */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Download className="text-blue-600 dark:text-blue-400" size={22} />
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                3. Data Storage & Sharing
                            </h2>
                        </div>
                        <p className="leading-relaxed">
                            Your trust is important to us. Here is how your data is managed:
                        </p>
                        <ul className="space-y-3.5 pl-5 list-disc">
                            <li className="leading-relaxed">
                                <strong>Local Storage:</strong> All files and log databases are stored locally on our secure server disks.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Zero Sharing:</strong> We do not sell, distribute, rent, or share your names or usage history with any third parties or advertisers.
                            </li>
                            <li className="leading-relaxed">
                                <strong>Control Your Info:</strong> If you wish to clear your name or download history from our servers, simply contact our support mail.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-slate-150 dark:border-slate-800" />

                    {/* Footer support callout */}
                    <section className="text-center bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-900/60">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                            Have questions or want your name removed?
                            <br />
                            Contact support at{" "}
                            <a
                                href="mailto:priyanshu210408@gmail.com"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                priyanshu210408@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
