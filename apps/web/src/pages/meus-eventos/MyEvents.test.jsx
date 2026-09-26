import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/client";
import MyEvents from "./MyEvents";
import { useFormContext } from "../../context/FormContext";

vi.mock("../../context/FormContext");
vi.mock("../../services/client", () => ({
  default: {
    getUserEvents: vi.fn(),
    getEventsReservations: vi.fn(),
    getRoomById: vi.fn(),
    getCourseById: vi.fn(),
  },
}));

const renderWith = (events) => {
  localStorage.setItem("userEmail", "prof@udf.edu.br");
  useFormContext.mockReturnValue({
    eventTypes: [], odsTypes: [], targetPublicTypes: [], resourcesTypes: [],
  });
  apiService.getUserEvents.mockResolvedValue({ events });
  apiService.getEventsReservations.mockResolvedValue([]);
  return render(
    <MemoryRouter>
      <MyEvents />
    </MemoryRouter>
  );
};

afterEach(() => localStorage.clear());

test("mostra o que a Coordenação pediu para mudar (LabTechUDF/python-services#35)", async () => {
  // A API grava o pedido em changesRequested; antes o card só dizia
  // "Alterações Solicitadas", sem dizer quais.
  renderWith([{
    _id: "e1", tituloEvento: "Palestra", status: "requested_change",
    changesRequested: "Trocar a sala para o auditório.",
  }]);

  expect(await screen.findByText("Trocar a sala para o auditório.")).toBeInTheDocument();
  expect(screen.getByText(/Pedido da Coordenação/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Editar Evento" }))
    .toHaveAttribute("href", "/event/type-selection?eventId=e1");
});

test("sem pedido de mudança, o card não mostra o bloco", async () => {
  renderWith([{ _id: "e2", tituloEvento: "Aula", status: "waiting" }]);

  expect(await screen.findByText("Aguardando")).toBeInTheDocument();
  expect(screen.queryByText(/Pedido da Coordenação/)).toBeNull();
});

test("rascunho aparece como Rascunho", async () => {
  // Antes: `case EventStatus.Draft` (chave inexistente) nunca batia e o card mostrava "draft".
  renderWith([{ _id: "e3", tituloEvento: "Oficina", status: "draft" }]);

  expect(await screen.findByText("Rascunho")).toBeInTheDocument();
});
