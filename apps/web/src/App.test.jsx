import { render, screen } from "@testing-library/react";
import App from "./App";
import apiService from "./services/client";

// Qualquer método do cliente vira um mock (a tela inicial não deve chamar a API).
vi.mock("./services/client", () => {
  const fns = {};
  const api = new Proxy({}, { get: (_, name) => (fns[name] ||= vi.fn().mockResolvedValue(null)) });
  return { default: api };
});

test("a página do organizador não pede os tipos à API (issue #24)", async () => {
  // A chamada a /types (que exige login) acontecia antes do login. Resolvido
  // quando o FormProvider passou a envolver só /event/* (Versão 1.0, 30/04/2025);
  // este teste impede a volta.
  window.history.pushState({}, "", "/organizer");
  render(<App />);

  expect(await screen.findByPlaceholderText(/email@udf\.edu\.br/)).toBeInTheDocument();
  expect(apiService.getTypes).not.toHaveBeenCalled();
});
