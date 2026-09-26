import { render, screen, fireEvent } from "@testing-library/react";
import apiService from "../../services/client";
import { MemoryRouter } from "react-router-dom";
import EventConfirmData from "./EventConfirmData";
import { useFormContext } from "../../context/FormContext";

vi.mock("../../context/FormContext");
vi.mock("../../services/client", () => ({
  default: { submitEvent: vi.fn() },
}));

const renderPage = (formData) => {
  useFormContext.mockReturnValue({ formData });
  return render(
    <MemoryRouter initialEntries={["/event/confirm-data?eventId=abc"]}>
      <EventConfirmData />
    </MemoryRouter>
  );
};

test("mostra os dados do evento em campos rotulados, não JSON (issue #36)", () => {
  const { container } = renderPage({
    tituloEvento: "Semana da Enfermagem",
    classificacao: "lecture",
    courseName: "ENFERMAGEM (BACHARELADO)",
    trilhaDesc: "",
    logo: {},
  });

  expect(screen.getByText("Título")).toBeInTheDocument();
  expect(screen.getByText("Semana da Enfermagem")).toBeInTheDocument();
  expect(screen.getByText("Curso vinculado")).toBeInTheDocument();
  expect(container.querySelector("pre")).toBeNull();
  expect(container.textContent).not.toMatch(/[{}]|trilhaDesc|"logo"/);
});

test("mantém o botão Confirmar", () => {
  renderPage({ tituloEvento: "X" });

  expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
});


test("falha da API ao confirmar aparece na tela (UX-01)", async () => {
  // Antes: o erro ia para o estado `errors`, que nunca era mostrado; o
  // organizador clicava em Confirmar e nada acontecia.
  apiService.submitEvent.mockResolvedValue({ ok: false, status: 500 });
  renderPage({ tituloEvento: "Semana da Enfermagem", classificacao: "exam" });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Falha ao enviar o evento");
});

test("erro de validação também aparece na tela", async () => {
  renderPage({ tituloEvento: "Oficina", classificacao: "workshop", numeroParticipantes: "", espacos: "" });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("Número de participantes é obrigatório.");
  expect(alert).toHaveTextContent("Selecione um espaço necessário.");
  expect(apiService.submitEvent).not.toHaveBeenCalled();
});

test("Confirmar envia reserva e evento numa requisição só (issue #64)", async () => {
  // Antes: POST /reservations e depois PUT /events; se o segundo falhasse a
  // sala ficava presa e a nova tentativa dava 409 na reserva do próprio evento.
  apiService.submitEvent.mockClear();
  apiService.submitEvent.mockResolvedValue({ ok: true, eventId: "abc" });
  const formData = { tituloEvento: "Prova", classificacao: "exam", roomId: "r1",
                     reservationDate: "2031-03-01T10:00:00.000Z" };
  renderPage(formData);

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  await vi.waitFor(() => expect(apiService.submitEvent).toHaveBeenCalledTimes(1));
  expect(apiService.submitEvent).toHaveBeenCalledWith(formData, "abc");
});

test("sala tomada por outro evento pede outro horário (409)", async () => {
  apiService.submitEvent.mockResolvedValue({ ok: false, status: 409 });
  renderPage({ tituloEvento: "Prova", classificacao: "exam" });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("outro evento reservou esta sala");
});

test("data que já passou pede outro horário (400)", async () => {
  // A API recusa reserva no passado (o calendário só barra dias anteriores,
  // não um horário que já passou hoje); antes a tela dizia só "Falha ao enviar".
  apiService.submitEvent.mockResolvedValue({ ok: false, status: 400 });
  renderPage({ tituloEvento: "Prova", classificacao: "exam" });

  fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("A data ou o horário já passou");
});
