import type { Cycle, Dose } from "./cycle-database";
import { saveDose } from "./cycle-database";

const WEEKDAY_BY_DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getTimesForDaily(times: number): string[] {
  if (times <= 1) return ["08:00"];
  if (times === 2) return ["08:00", "20:00"];
  return ["06:00", "12:00", "20:00"];
}

/**
 * Generate all dose records for a cycle based on its frequency
 */
export async function generateDosesForCycle(cycle: Cycle): Promise<{ success: boolean; count: number; error?: string }> {
  const doses: Dose[] = [];
  const freq = cycle.frequency;
  
  let d = new Date(cycle.startDate);
  d.setHours(0, 0, 0, 0);
  
  const end = new Date(cycle.endDate);
  end.setHours(23, 59, 59, 999);
  
  while (d.getTime() <= end.getTime()) {
    const key = toDateKey(d);
    const dayName = WEEKDAY_BY_DOW[d.getDay()];
    
    if (freq.type === "daily") {
      const times = getTimesForDaily(freq.times);
      times.forEach((time) => {
        doses.push({
          id: `${cycle.id}-${key}-${time}`,
          cycleId: cycle.id,
          peptideName: cycle.peptideName,
          doseAmount: cycle.doseAmount,
          route: "SubQ",
          timeLabel: time,
          scheduledDate: key,
          status: "scheduled",
        });
      });
    } else if (freq.type === "weekly" && freq.days?.length) {
      if (freq.days.includes(dayName)) {
        const time = "08:00";
        doses.push({
          id: `${cycle.id}-${key}-${time}`,
          cycleId: cycle.id,
          peptideName: cycle.peptideName,
          doseAmount: cycle.doseAmount,
          route: "SubQ",
          timeLabel: time,
          scheduledDate: key,
          status: "scheduled",
        });
      }
    } else if (freq.type === "monthly" && freq.dates?.length) {
      const dom = d.getDate();
      if (freq.dates.includes(dom)) {
        const time = "08:00";
        doses.push({
          id: `${cycle.id}-${key}-${time}`,
          cycleId: cycle.id,
          peptideName: cycle.peptideName,
          doseAmount: cycle.doseAmount,
          route: "SubQ",
          timeLabel: time,
          scheduledDate: key,
          status: "scheduled",
        });
      }
    }
    
    d = addDays(d, 1);
  }
  
  // Save all doses to database
  let savedCount = 0;
  for (const dose of doses) {
    const result = await saveDose(dose);
    if (result.success) {
      savedCount++;
    }
  }
  
  if (savedCount < doses.length) {
    return {
      success: false,
      count: savedCount,
      error: `Only ${savedCount}/${doses.length} doses saved`,
    };
  }
  
  return {
    success: true,
    count: savedCount,
  };
}
