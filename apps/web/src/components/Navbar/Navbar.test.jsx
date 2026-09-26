import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import apiService from "../../services/client";

vi.mock("../../services/client", () => ({
  default: { getPermissions: vi.fn().mockResolvedValue({ manageOffers: false }) },
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
      <Routes>
        <Route path="/organizer" element={<p>tela de login</p>} />
        <Route path="*" element={<p>outra tela</p>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => localStorage.clear());

test("Sair apaga a sessão e o rascunho e volta para o login (issue #17)", () => {
  localStorage.setItem("token", "t");
  localStorage.setItem("userEmail", "prof@udf.edu.br");
  localStorage.setItem("formData", "{}");
  localStorage.setItem("eventId", "e1");
  renderAt("/event/my-events");

  fireEvent.click(screen.getByRole("button", { name: "Sair" }));

  expect(localStorage.length).toBe(0);
  expect(screen.getByText("tela de login")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
});

test("sem sessão não mostra o botão Sair", () => {
  renderAt("/");
  expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument();
});

test("link Ofertas só para quem tem permissão (item 5)", async () => {
  localStorage.setItem("token", "t");
  localStorage.setItem("userEmail", "secretaria@udf.edu.br");
  apiService.getPermissions.mockResolvedValueOnce({ manageOffers: true });
  renderAt("/");
  fireEvent.click(await screen.findByRole("button", { name: "Ofertas" }));
  expect(screen.getByText("outra tela")).toBeInTheDocument();
});

test("sem permissão não mostra o link Ofertas", async () => {
  localStorage.setItem("token", "t");
  renderAt("/");
  await vi.waitFor(() => expect(apiService.getPermissions).toHaveBeenCalled());
  expect(screen.queryByRole("button", { name: "Ofertas" })).not.toBeInTheDocument();
});
