"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign } from "lucide-react";
import {
  getTotalSpending,
  getMonthlySpending,
  getExpiringInventory,
} from "@/lib/expense-database";

export default function ExpenseDashboardWidget() {
  const [monthTotal, setMonthTotal] = useState<number | null>(null);
  const [last3Months, setLast3Months] = useState<{ month: string; total: number }[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const endOfMonth = now.toISOString().slice(0, 10);

    Promise.all([
      getTotalSpending(startOfMonth, endOfMonth),
      getMonthlySpending(3),
      getExpiringInventory(30),
    ]).then(([total, monthly, expiring]) => {
      setMonthTotal(total);
      setLast3Months(monthly);
      setExpiringCount(expiring.length);
      setLoading(false);
    });
  }, []);

  const maxVal = Math.max(...last3Months.map((m) => m.total), 1);

  return (
    <div className="group deck-card-bg deck-border-thick relative rounded-xl p-5 pt-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#00ffaa]/40 hover:shadow-lg animate-fade-in">
      <div className="led-card-top-right">
        <span
          className={`led-dot ${expiringCount > 0 ? "led-amber" : "led-green"}`}
          aria-hidden="true"
        />
      </div>

      <span className="hex-id absolute left-6 top-3 z-10" aria-hidden="true">
        0xEXP
      </span>

      <div className="flex items-center gap-2 mt-3">
        <DollarSign className="w-4 h-4 text-[#00ffaa] shrink-0" />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#f5f5f7] font-space-mono">
        Expenses
      </h3>

      {loading ? (
        <p className="mt-3 text-xs text-[#9a9aa3] font-mono">Loading...</p>
      ) : (
        <>
          <div className="mt-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
              This month
            </span>
            <p className="font-mono text-2xl font-bold text-[#00ffaa] mt-0.5 drop-shadow-[0_0_12px_rgba(0,255,170,0.5)]">
              ${(monthTotal ?? 0).toFixed(2)}
            </p>
          </div>

          {last3Months.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9a9aa3]">
                Last 3 months
              </span>
              <div className="mt-1.5 flex items-end gap-1 h-10">
                {last3Months.map((m) => {
                  const pct = maxVal ? m.total / maxVal : 0;
                  const barH = Math.max(4, Math.round(pct * 28));
                  return (
                    <div
                      key={m.month}
                      className="flex-1 min-w-0 flex flex-col items-center"
                      title={`${m.month}: $${m.total.toFixed(2)}`}
                    >
                      <div
                        className="w-full rounded-t bg-[#00ffaa]/50 border border-[#00ffaa]/40 transition-all"
                        style={{ height: `${barH}px` }}
                      />
                      <span className="font-mono text-[8px] text-[#9a9aa3] mt-1 truncate w-full text-center">
                        {m.month.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {expiringCount > 0 && (
            <div className="mt-3">
              <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                {expiringCount} expiring in 30d
              </span>
            </div>
          )}
        </>
      )}

      <Link href="/app/expenses">
        <button className="mt-4 flex w-full items-center justify-center rounded-lg border-[#00ffaa]/40 bg-[#00ffaa]/5 px-4 py-2.5 font-mono text-xs font-medium text-[#00ffaa] transition-colors hover:bg-[#00ffaa]/15 hover:border-[#00ffaa]/60">
          View Details
        </button>
      </Link>
    </div>
  );
}
