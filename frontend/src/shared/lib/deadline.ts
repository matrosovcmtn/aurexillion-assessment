/** True when deadline calendar day is today or earlier (local timezone). */
export function isDeadlineDueOrOverdue(deadlineIso: string, now = new Date()): boolean {
  const deadline = new Date(deadlineIso);
  if (Number.isNaN(deadline.getTime())) return false;

  const dueDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dueDay.getTime() <= today.getTime();
}
