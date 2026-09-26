import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventBasicInfo from "./EventBasicInfo";
import { useFormContext } from "../../context/FormContext";

vi.mock("../../context/FormContext");
vi.mock("../../services/client", () => ({}));

test("telefone do organizador recebe a máscara (XX) X XXXX-XXXX", () => {
  // react-input-mask (última versão em 2018) usa ReactDOM.findDOMNode, que o
  // React 19 removeu: a tela quebrava ao montar o campo de telefone.
  const received = [];
  useFormContext.mockReturnValue({
    formData: {},
    handleChange: (e) => received.push([e.target.name, e.target.value]),
    saveDraft: vi.fn(),
    handleOdsChange: vi.fn(),
    fillOutFormData: vi.fn(),
    eventTypes: [],
    odsTypes: [],
    loading: false,
    setLoading: vi.fn(),
  });
  render(
    <MemoryRouter initialEntries={["/event/basic-info"]}>
      <EventBasicInfo />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "61999990000" } });

  expect(received.at(-1)).toEqual(["telefone", "(61) 9 9999-0000"]);
});
