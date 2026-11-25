const WIB_TZ = "Asia/Jakarta";

export function formatRupiah(amount: number): string {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `Rp${formatted}`;
}

export function formatElapsedMinutes(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min elapsed`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m elapsed` : `${hrs}h elapsed`;
}

export function formatWibTime(input: Date | string = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "--:-- WIB";
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${timeStr} WIB`;
}

export function formatWibLongDate(input: Date | string = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatWibOrderReceived(isoString: string): {
  timeLabel: string;
  dateLabel: string;
} {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return { timeLabel: "—", dateLabel: "—" };
  }
  const now = new Date();
  const sameDay =
    new Intl.DateTimeFormat("en-CA", { timeZone: WIB_TZ }).format(date) ===
    new Intl.DateTimeFormat("en-CA", { timeZone: WIB_TZ }).format(now);

  const hhmm = formatWibTime(date);
  return {
    timeLabel: sameDay ? `Today, ${hhmm}` : hhmm,
    dateLabel: formatWibLongDate(date),
  };
}

export function formatWibShortStamp(date: Date = new Date()): string {
  const day = new Intl.DateTimeFormat("id-ID", {
    timeZone: WIB_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(":", ".");
  return `${day}, ${time} WIB`;
}

export function getWibServicePeriod(date: Date = new Date()): string {
  const hourStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: WIB_TZ,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  const hour = Number(hourStr);
  if (hour < 10) return "Breakfast service";
  if (hour < 15) return "Lunch service";
  return "Dinner service";
}

export function padTwo(num: number): string {
  return String(num).padStart(2, "0");
}
