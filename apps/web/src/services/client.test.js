// Mock com fábrica: o axios é ESM e o jest do CRA não o transforma.
const mockGet = vi.fn();
vi.mock("axios", () => ({
  __esModule: true,
  default: {
    create: () => ({
      get: (...args) => mockGet(...args),
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    }),
  },
}));

test("getCourseById devolve o curso único que a rota entrega (issue #37)", async () => {
  const get = mockGet.mockResolvedValue({
    status: 200,
    data: { course: { id: 31, name: "ENFERMAGEM (BACHARELADO)" } },
  });

  const { default: apiService } = await import("./client");
  const course = await apiService.getCourseById(31);

  expect(get).toHaveBeenCalledWith("/courses", { params: { course_id: 31 } });
  expect(course).toEqual({ id: 31, name: "ENFERMAGEM (BACHARELADO)" });
});
