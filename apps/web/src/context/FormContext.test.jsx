import { render, act } from "@testing-library/react";
import { FormProvider, useFormContext } from "./FormContext";
import apiService from "../services/client";

vi.mock("../services/client", () => ({
  default: {
    getTypes: vi.fn().mockResolvedValue({ types: [] }),
    getUserEvents: vi.fn(),
    getCourseById: vi.fn(),
  },
}));

beforeEach(() => localStorage.clear());

test("voltar para os dados básicos não apaga o curso escolhido e ainda não salvo (issue #25)", async () => {
  // Rascunho salvo nos dados básicos, ainda sem curso.
  apiService.getUserEvents.mockResolvedValue({
    events: [{ _id: "e1", name: "Semana", organizer: { phone: "" } }],
  });
  apiService.getCourseById.mockResolvedValue(null);
  let ctx;
  const Spy = () => {
    ctx = useFormContext();
    return null;
  };
  render(
    <FormProvider>
      <Spy />
    </FormProvider>
  );

  await act(() => ctx.fillOutFormData("e1")); // abre os dados básicos
  act(() => ctx.handleCursoChanged("ENFERMAGEM", 31)); // escolhe o curso nos detalhes
  await act(() => ctx.fillOutFormData("e1")); // seta "voltar": dados básicos montam de novo

  expect(ctx.formData.courseId).toBe(31);
  expect(ctx.formData.courseName).toBe("ENFERMAGEM");
  expect(apiService.getUserEvents).toHaveBeenCalledTimes(1);
});

test("abrir outro evento ainda carrega o rascunho dele da API", async () => {
  apiService.getUserEvents.mockResolvedValue({
    events: [
      { _id: "e1", name: "Um", organizer: { phone: "" } },
      { _id: "e2", name: "Dois", organizer: { phone: "" }, graduationId: 7 },
    ],
  });
  apiService.getCourseById.mockResolvedValue({ id: 7, name: "DIREITO" });
  let ctx;
  const Spy = () => {
    ctx = useFormContext();
    return null;
  };
  render(
    <FormProvider>
      <Spy />
    </FormProvider>
  );

  await act(() => ctx.fillOutFormData("e1"));
  await act(() => ctx.fillOutFormData("e2"));

  expect(ctx.formData.tituloEvento).toBe("Dois");
  expect(ctx.formData.courseName).toBe("DIREITO");
});
