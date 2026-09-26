// Períodos da agenda e o horário de início de cada um (horário local).
export const PERIOD_TO_TIME = {
  Manha: "08:00:00",
  Tarde: "14:00:00",
  Noite: "19:00:00",
};
export const PERIODS = Object.keys(PERIOD_TO_TIME);

// Mesmo dia de `date`, no horário de início do período.
export const atPeriod = (date, period) => {
  const [h, m, s] = PERIOD_TO_TIME[period].split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, s, 0);
  return d;
};

// A API recusa reserva que começa antes de agora.
export const isPastSlot = (date, period, now = new Date()) =>
  atPeriod(date, period) < now;

// Primeiro período de `date` que ainda não começou, ou null.
export const firstPeriodOf = (date, now = new Date()) =>
  PERIODS.find((p) => !isPastSlot(date, p, now)) || null;

// Onde a agenda abre: o primeiro período livre de hoje, ou amanhã de manhã.
export const firstAvailableSlot = (now = new Date()) => {
  const today = firstPeriodOf(now, now);
  if (today) return { date: atPeriod(now, today), period: today };
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { date: atPeriod(tomorrow, PERIODS[0]), period: PERIODS[0] };
};
