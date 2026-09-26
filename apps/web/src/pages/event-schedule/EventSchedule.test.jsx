import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventSchedule from "./EventSchedule";
import { useFormContext } from "../../context/FormContext";

vi.mock("../../context/FormContext");
vi.mock("../../components/infinite-scroll-rooms/InfiniteScrollRooms", () => ({
  default: ({ date, time }) => <p data-testid="busca">{`${date.toISOString()} ${time}`}</p>,
}));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 8, 25, 14, 31));
  useFormContext.mockReturnValue({ handleRoomDataChange: vi.fn(), formData: {} });
});
afterEach(() => vi.useRealTimers());

test("às 14:31 a agenda não oferece manhã nem tarde de hoje (API recusa horário passado)", () => {
  // Antes abria sempre em "hoje, Manhã 08:00": depois das 8h o pedido ia para
  // um horário que já passou.
  render(<MemoryRouter><EventSchedule /></MemoryRouter>);

  expect(screen.getByLabelText("Noite")).toBeChecked();
  expect(screen.getByLabelText("Manhã")).toBeDisabled();
  expect(screen.getByLabelText("Tarde")).toBeDisabled();
  expect(screen.getByTestId("busca")).toHaveTextContent(
    `${new Date(2026, 8, 25, 19, 0).toISOString()} 19:00:00`);
});
