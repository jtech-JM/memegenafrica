import React, { useEffect } from "react";
import { Terminal } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { fetchLogs, executeQuery } from "../../api/db.api";
import Button from "../ui/Button";

const LOG_LEVEL_COLOR: Record<string, string> = {
  INFO:    "text-blue-400",
  SUCCESS: "text-emerald-400",
  WARN:    "text-yellow-400",
  ERROR:   "text-red-400",
};

export default function SystemConsole() {
  const store = useAppStore();

  // Poll logs every 5 seconds while panel is open
  useEffect(() => {
    const refresh = async () => {
      const logs = await fetchLogs();
      store.setLogs(logs);
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExecuteSQL = async () => {
    store.setSqlError("");
    store.setSqlResultRows(null);
    store.setSqlMessage("");
    store.setSqlSuccessMsg("");
    if (!store.customSQLQuery.trim()) return;

    const result = await executeQuery(store.customSQLQuery);
    if (result.error) {
      store.setSqlError(result.error);
    } else if (result.rows && result.rows.length > 0) {
      store.setSqlResultRows(result.rows);
      store.setSqlMessage(`Returned ${result.rows.length} row(s).`);
    } else if (result.success) {
      store.setSqlSuccessMsg(result.message || "Query executed successfully.");
    } else {
      store.setSqlMessage(result.message || "Query executed. No rows returned.");
    }
  };

  return (
    <div className="space-y-5">

      {/* SQL Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-red-400" /> SQL Explorer
        </h3>
        <textarea
          value={store.customSQLQuery}
          onChange={(e) => store.setCustomSQLQuery(e.target.value)}
          rows={4}
          spellCheck={false}
          className="w-full bg-slate-950 border border-slate-800 focus:border-red-400/60 text-xs text-green-400 px-3 py-2.5 rounded-xl focus:outline-none resize-none font-mono"
        />
        <Button variant="danger" size="sm" onClick={handleExecuteSQL} icon={<Terminal />}>
          Execute Query
        </Button>

        {/* Output */}
        {store.sqlError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 font-mono">
            ERROR: {store.sqlError}
          </div>
        )}
        {store.sqlSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 font-mono">
            ✓ {store.sqlSuccessMsg}
          </div>
        )}
        {store.sqlMessage && !store.sqlError && !store.sqlSuccessMsg && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-xs text-blue-400 font-mono">
            {store.sqlMessage}
          </div>
        )}
        {store.sqlResultRows && store.sqlResultRows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-[10px] font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  {Object.keys(store.sqlResultRows[0]).map((col) => (
                    <th key={col} className="px-3 py-2 text-left text-gray-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {store.sqlResultRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-3 py-2 text-gray-300 whitespace-nowrap max-w-xs truncate">
                        {String(val ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activity Logs</h3>
          <span className="text-[9px] text-gray-500 bg-slate-800 px-2 py-0.5 rounded font-mono">{store.logs.length} entries · auto-refresh 5s</span>
        </div>
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 max-h-80 overflow-y-auto space-y-1 font-mono text-[10px]">
          {store.logs.length === 0 ? (
            <p className="text-gray-600">No logs yet.</p>
          ) : (
            store.logs.map((log, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-gray-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString("en-KE")}</span>
                <span className={`shrink-0 font-bold ${LOG_LEVEL_COLOR[log.level] || "text-gray-400"}`}>[{log.level}]</span>
                <span className="text-amber-500/80 shrink-0">{log.component}</span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
