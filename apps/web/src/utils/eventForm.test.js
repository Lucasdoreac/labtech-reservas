import { eventToFormData } from "./eventForm";

const savedEvent = {
  name: "Semana de Enfermagem",
  organizer: { phone: "61 99999-0000" },
  eventTypeId: "lecture",
  odsId: 3,
  description: "Palestras",
  graduationId: 31,
  eventLogo: "",
};

test("rascunho sem logo continua sem logo (sem host fixo)", () => {
  // Antes o logo virava "dwcorp.com.br:9000/.../magic-link.png": o ícone do
  // e-mail de login, num host de produção fixo no código.
  const form = eventToFormData(savedEvent, "ENFERMAGEM", [{ id: 3, formatted: "3 - Saúde" }]);

  expect(form.logo).toBeNull();
  expect(JSON.stringify(form)).not.toMatch(/dwcorp/);
  expect(form.odsName).toBe("3 - Saúde");
  expect(form.courseName).toBe("ENFERMAGEM");
});

test("rascunho com logo mantém o logo do próprio evento", () => {
  const form = eventToFormData({ ...savedEvent, eventLogo: "http://minio:9000/labtech/logos/ev.png" }, "");

  expect(form.logo).toBe("http://minio:9000/labtech/logos/ev.png");
});
