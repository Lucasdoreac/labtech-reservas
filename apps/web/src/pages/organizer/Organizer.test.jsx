import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Organizer from "./Organizer";
import apiService from "../../services/client";

vi.mock("../../services/client", () => ({ default: { postAuthMail: vi.fn() } }));

test("Enter no campo de e-mail envia o link de acesso (issue #34)", async () => {
  // Antes o campo e o botão não estavam num <form>: Enter não fazia nada.
  apiService.postAuthMail.mockResolvedValue({ magic_link: "http://front/auth/callback?x" });
  render(<MemoryRouter><Organizer /></MemoryRouter>);

  await userEvent.type(screen.getByPlaceholderText(/email@udf\.edu\.br/), "prof@udf.edu.br{enter}");

  await waitFor(() => expect(apiService.postAuthMail).toHaveBeenCalledWith("prof@udf.edu.br"));
});

test("só @udf.edu.br passa: sem exceção para e-mail pessoal fixo no código", async () => {
  // O auth_service recusa qualquer outro domínio (400); a exceção antiga deixava
  // o e-mail passar aqui e a tela respondia "Serviço indisponível".
  apiService.postAuthMail.mockClear();
  localStorage.clear(); // o teste anterior deixa o e-mail salvo e o campo já preenchido
  render(<MemoryRouter><Organizer /></MemoryRouter>);

  await userEvent.type(screen.getByPlaceholderText(/email@udf\.edu\.br/), "danrley.pereira@cs.udf.edu.br{enter}");

  expect(await screen.findByText("O campo e-mail está fora do formato permitido.")).toBeInTheDocument();
  expect(apiService.postAuthMail).not.toHaveBeenCalled();
});
