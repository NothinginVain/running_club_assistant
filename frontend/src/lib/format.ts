export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatWeekday(value: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(
    new Date(value),
  );
}

export function formatDistance(km: number): string {
  return `${km % 1 === 0 ? km.toFixed(0) : km.toFixed(1)} km`;
}

export function titleCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
