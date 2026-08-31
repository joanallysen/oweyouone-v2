"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="flex gap-2">
        {["dark", "light", "bloom"].map((t) => (
        <button
            key={t}
            onClick={() => setTheme(t)}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm capitalize ${
                theme === t
                ? "border-accent-bg text-text"
                : "border-border text-sec"
            }`}
            >
            {t}
        </button>
        ))}
        </div>
  );
}