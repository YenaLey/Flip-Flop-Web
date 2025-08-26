import { Log } from "@/types";

const LS_KEY = "async_logs_v1";

export const loadLogs = (): Log[] => {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
        return [];
    }
};

export const saveLogs = (logs: Log[]) => localStorage.setItem(LS_KEY, JSON.stringify(logs));
