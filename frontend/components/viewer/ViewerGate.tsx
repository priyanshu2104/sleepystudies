"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";

type Props = {
    children: React.ReactNode;
};

export default function ViewerGate({
    children,
}: Props) {

    const [ready, setReady] = useState(false);

    const [name, setName] = useState("");

    useEffect(() => {

        const viewer = localStorage.getItem("viewer");

        if (viewer) {
            setReady(true);
        }

    }, []);

    async function continueReading() {
        if (!name.trim()) return;

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

            localStorage.setItem(
                "viewer",
                JSON.stringify(viewer)
            );

            setReady(true);
        } catch (err) {
            console.error("Viewer registration error:", err);
            // Fallback locally in case backend is down
            const fallbackId = crypto.randomUUID().slice(0, 8).toUpperCase();
            const viewer = {
                name: name.trim(),
                viewerId: fallbackId,
                id: fallbackId,
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem(
                "viewer",
                JSON.stringify(viewer)
            );
            setReady(true);
        }
    }

    if (ready) return <>{children}</>;

    return (

        <div className="flex min-h-screen items-center justify-center bg-slate-100">

            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

                <h1 className="text-3xl font-bold">
                    Welcome to SleepyStudies
                </h1>

                <p className="mt-3 text-slate-500">
                    Enter your name once to continue reading.
                </p>

                <input
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                    placeholder="Your Name"
                    className="mt-8 w-full rounded-xl border p-4 outline-none"
                />

                <button
                    onClick={continueReading}
                    className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white"
                >
                    Continue Reading
                </button>

            </div>

        </div>

    );
}