import { summarizeEventData } from "./eventSummary";

const byLabel = (rows) => Object.fromEntries(rows.map((r) => [r.label, r.value]));

test("mostra rótulos legíveis para os campos preenchidos", () => {
  const rows = summarizeEventData({
    tituloEvento: "Semana da Enfermagem",
    classificacao: "lecture",
    descricaoEvento: "Palestra aberta",
    courseName: "ENFERMAGEM (BACHARELADO)",
    numeroParticipantes: "40",
    espacos: "Auditório",
  });

  expect(byLabel(rows)).toMatchObject({
    Título: "Semana da Enfermagem",
    "Tipo de evento": "Palestra",
    Descrição: "Palestra aberta",
    "Curso vinculado": "ENFERMAGEM (BACHARELADO)",
    "Número de participantes": "40",
    "Espaço necessário": "Auditório",
  });
});

test("esconde campos vazios, objetos vazios e o logo (issue #36)", () => {
  const rows = summarizeEventData({
    tituloEvento: "Evento",
    trilhaDesc: "",
    projetoDesc: undefined,
    logo: {},
    eventId: "abc",
    roomId: "sala-1",
    alunosMonitores: [],
    telefone: null,
  });

  expect(rows.map((r) => r.label)).toEqual(["Título"]);
});

test("nunca devolve JSON cru nem chaves internas como valor", () => {
  const rows = summarizeEventData({ tituloEvento: "X", logo: { a: 1 }, eventId: "abc" });

  rows.forEach((r) => expect(String(r.value)).not.toMatch(/[{}]/));
});

test("trilha e projeto combinam sim/não com a descrição", () => {
  const rows = byLabel(
    summarizeEventData({
      trilha: "sim",
      trilhaDesc: "Empreendedorismo social",
      projeto: "nao",
      projetoDesc: "",
    })
  );

  expect(rows["Trilha empreendedora"]).toBe("Sim — Empreendedorismo social");
  expect(rows["Projeto de extensão"]).toBe("Não");
});

test("alunos monitores aceitam texto ou objetos e viram uma lista", () => {
  const rows = byLabel(
    summarizeEventData({ alunosMonitores: ["31891942", { name: "Ana", id: "30008021" }] })
  );

  expect(rows["Alunos monitores"]).toBe("31891942, Ana");
});

test("formata a data da reserva em pt-BR", () => {
  const rows = byLabel(summarizeEventData({ reservationDate: "2026-10-05T13:30:00.000Z" }));

  expect(rows["Data da reserva"]).toMatch(/05\/10\/2026/);
});
