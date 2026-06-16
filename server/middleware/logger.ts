export type LogEntry = {
  timestamp: string;
  level: string;
  component: string;
  message: string;
};

// Accurate startup entries reflecting the actual stack
export const logs: LogEntry[] = [
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    level: "INFO",
    component: "Gateway/API",
    message: "Node.js (Express) gateway initializing",
  },
  {
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    level: "INFO",
    component: "Database",
    message: "Supabase PostgreSQL client connected",
  },
  {
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    level: "INFO",
    component: "AI Compute",
    message: "Gemini client ready — awaiting GEMINI_API_KEY validation",
  },
];

export function addLog(component: string, message: string, level = "INFO"): void {
  logs.unshift({ timestamp: new Date().toISOString(), level, component, message });
  if (logs.length > 50) logs.pop();
}
