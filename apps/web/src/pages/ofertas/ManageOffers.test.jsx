import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/client";
import ManageOffers from "./ManageOffers";

vi.mock("../../services/client", () => ({
  default: { getManagedOffers: vi.fn(), setOfferWeekdays: vi.fn() },
}));

const OFFER = { id: "o1", offerId: 10, discipline: "CÁLCULO I", period: "NOITE", room: "101",
                teacher: "Prof. X", campus: "SEDE", weekdays: [1] };

const renderPage = () => render(<MemoryRouter><ManageOffers /></MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

test("marca os dias de uma oferta e salva (item 5: sem dia a aula não bloqueia sala)", async () => {
  apiService.getManagedOffers.mockResolvedValue({ ok: true, offers: [OFFER], page: 1, pageSize: 20 });
  apiService.setOfferWeekdays.mockResolvedValue({ ok: true, weekdays: [1, 3] });
  renderPage();

  const row = (await screen.findByText("CÁLCULO I")).closest("tr");
  expect(within(row).getByLabelText("Seg")).toBeChecked();
  fireEvent.click(within(row).getByLabelText("Qua"));
  fireEvent.click(within(row).getByRole("button", { name: "Salvar" }));

  expect(await within(row).findByText("Salvo")).toBeInTheDocument();
  expect(apiService.setOfferWeekdays).toHaveBeenCalledWith("o1", [1, 3]);
});

test("busca pela disciplina, ano e semestre", async () => {
  apiService.getManagedOffers.mockResolvedValue({ ok: true, offers: [], page: 1, pageSize: 20 });
  renderPage();
  await screen.findByText(/Nenhuma oferta/);

  fireEvent.change(screen.getByLabelText("Disciplina"), { target: { value: "anatomia" } });
  fireEvent.change(screen.getByLabelText("Ano"), { target: { value: "2024" } });
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

  await vi.waitFor(() => expect(apiService.getManagedOffers).toHaveBeenLastCalledWith(
    expect.objectContaining({ discipline: "anatomia", year: 2024, page: 1 })));
});

test("sem permissão mostra aviso em vez da lista", async () => {
  apiService.getManagedOffers.mockResolvedValue({ ok: false, status: 403 });
  renderPage();
  expect(await screen.findByText(/não tem acesso/)).toBeInTheDocument();
});
