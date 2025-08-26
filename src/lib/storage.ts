import type { Log, Settings } from "@/types";

const LOGS = "async_logs_v1";
const SETS = "async_settings_v1";

export const loadLogs = (): Log[] => {
    try {
        return JSON.parse(localStorage.getItem(LOGS) || "[]");
    } catch {
        return [];
    }
};
export const saveLogs = (v: Log[]) => localStorage.setItem(LOGS, JSON.stringify(v));

export const loadSettings = (): Settings | null => {
    try {
        const s = localStorage.getItem(SETS);
        return s ? (JSON.parse(s) as Settings) : null;
    } catch {
        return null;
    }
};
export const saveSettings = (s: Settings) => localStorage.setItem(SETS, JSON.stringify(s));
