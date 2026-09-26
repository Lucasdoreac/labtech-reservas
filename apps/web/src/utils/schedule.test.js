import { firstAvailableSlot, isPastSlot } from "./schedule";

// 25/09/2026 14:31 no fuso local
const now = new Date(2026, 8, 25, 14, 31);

test("período que já começou hoje é passado; o que ainda não começou, não", () => {
  expect(isPastSlot(now, "Manha", now)).toBe(true);
  expect(isPastSlot(now, "Tarde", now)).toBe(true); // 14:00 já passou
  expect(isPastSlot(now, "Noite", now)).toBe(false);
  expect(isPastSlot(new Date(2026, 8, 26), "Manha", now)).toBe(false);
});

test("a agenda abre no primeiro período ainda livre de hoje", () => {
  const { date, period } = firstAvailableSlot(now);
  expect(period).toBe("Noite");
  expect(date).toEqual(new Date(2026, 8, 25, 19, 0, 0));
});

test("depois do último período, abre amanhã de manhã", () => {
  const { date, period } = firstAvailableSlot(new Date(2026, 8, 25, 19, 30));
  expect(period).toBe("Manha");
  expect(date).toEqual(new Date(2026, 8, 26, 8, 0, 0));
});
