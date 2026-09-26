import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventLogistics from "./EventLogistics";
import { useFormContext } from "../../context/FormContext";

vi.mock("../../context/FormContext");
vi.mock("../../services/client", () => ({}));

const renderPage = (formData, saveDraft = vi.fn().mockResolvedValue("ev1")) => {
  const handleChange = vi.fn();
  useFormContext.mockReturnValue({ formData, handleChange, saveDraft, handleSaveAlunoMonitor: vi.fn() });
  render(<MemoryRouter><EventLogistics /></MemoryRouter>);
  return { saveDraft, handleChange };
};

test("Sim sem descrição não avança (issue #35)", async () => {
  const { saveDraft } = renderPage({ trilha: "sim", trilhaDesc: "", projeto: "sim", projetoDesc: "" });

  fireEvent.click(screen.getByRole("button", { name: "Próximo" }));

  expect(await screen.findByText("Descreva a trilha empreendedora.")).toBeInTheDocument();
  expect(screen.getByText("Descreva o projeto de extensão.")).toBeInTheDocument();
  expect(saveDraft).not.toHaveBeenCalled();
});

test("com Sim e descrição, avança", async () => {
  const { saveDraft } = renderPage({ trilha: "sim", trilhaDesc: "Startup", projeto: "nao" });

  fireEvent.click(screen.getByRole("button", { name: "Próximo" }));

  await waitFor(() => expect(saveDraft).toHaveBeenCalled());
});

test("com Não, o campo de descrição fica desabilitado e é limpo ao trocar (issue #35)", () => {
  const { handleChange } = renderPage({ trilha: "nao", projeto: "sim", projetoDesc: "x" });

  expect(screen.getByLabelText("Se sim, digite aqui", { selector: "#trilhaDesc" })).toBeDisabled();
  expect(screen.getByLabelText("Se sim, digite aqui", { selector: "#projetoDesc" })).toBeEnabled();

  fireEvent.change(screen.getByLabelText("Projeto Extensão"), { target: { name: "projeto", value: "nao" } });
  expect(handleChange).toHaveBeenCalledWith({ target: { name: "projetoDesc", value: "" } });
});
