import { useCallback, useEffect, useState } from "react";
import apiService from "../../services/client";
import Loading from "../../components/Loading";

// ISO 8601, como o catálogo guarda: 1 = segunda ... 7 = domingo.
const DIAS = [[1, "Seg"], [2, "Ter"], [3, "Qua"], [4, "Qui"], [5, "Sex"], [6, "Sáb"], [7, "Dom"]];

const semestreAtual = () => {
  const hoje = new Date();
  return { year: hoje.getFullYear(), semester: hoje.getMonth() < 6 ? 1 : 2 };
};

// Uma linha por oferta: os dias ficam editáveis e cada linha salva sozinha.
function OfferRow({ offer }) {
  const [dias, setDias] = useState(offer.weekdays);
  const [estado, setEstado] = useState("");

  const alternar = (dia) => {
    setEstado("");
    setDias((atual) => (atual.includes(dia) ? atual.filter((d) => d !== dia) : [...atual, dia].sort()));
  };

  const salvar = async () => {
    setEstado("Salvando...");
    const result = await apiService.setOfferWeekdays(offer.id, dias);
    setEstado(result.ok ? "Salvo" : "Falhou, tente de novo");
  };

  return (
    <tr>
      <td>{offer.discipline}</td>
      <td>{offer.period}</td>
      <td>{offer.room}</td>
      <td>{offer.teacher}</td>
      <td>
        {DIAS.map(([dia, rotulo]) => (
          <label key={dia} className="me-2">
            <input type="checkbox" checked={dias.includes(dia)} onChange={() => alternar(dia)} /> {rotulo}
          </label>
        ))}
      </td>
      <td>
        <button type="button" className="btn btn-sm btn-primary" onClick={salvar}>Salvar</button>{" "}
        <span role="status">{estado}</span>
      </td>
    </tr>
  );
}

const ManageOffers = () => {
  const [filtro, setFiltro] = useState({ ...semestreAtual(), discipline: "" });
  const [busca, setBusca] = useState({ ...semestreAtual(), discipline: "", page: 1 });
  const [resultado, setResultado] = useState(null);

  const carregar = useCallback(async () => {
    setResultado(null);
    setResultado(await apiService.getManagedOffers(busca));
  }, [busca]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const buscar = (e) => {
    e.preventDefault();
    setBusca({ ...filtro, page: 1 });
  };

  const campo = (nome, tipo = "text") => (
    <input id={`f-${nome}`} type={tipo} className="form-control" value={filtro[nome]}
           onChange={(e) => setFiltro({ ...filtro, [nome]: tipo === "number" ? Number(e.target.value) : e.target.value })} />
  );

  if (resultado && !resultado.ok && resultado.status === 403) {
    return <p className="m-4">Você não tem acesso à tela de ofertas.</p>;
  }

  return (
    <div className="container my-4">
      <h2>Ofertas: dias da semana das aulas</h2>
      <p className="text-muted">
        Sem dia da semana, a aula não reserva a sala e ela aparece livre para eventos.
      </p>
      <form className="row g-2 align-items-end mb-3" onSubmit={buscar}>
        <div className="col-md-5"><label htmlFor="f-discipline">Disciplina</label>{campo("discipline")}</div>
        <div className="col-md-2"><label htmlFor="f-year">Ano</label>{campo("year", "number")}</div>
        <div className="col-md-2"><label htmlFor="f-semester">Semestre</label>{campo("semester", "number")}</div>
        <div className="col-md-2"><button type="submit" className="btn btn-primary">Buscar</button></div>
      </form>

      {!resultado ? (
        <Loading />
      ) : !resultado.ok ? (
        <p role="alert">Não foi possível carregar as ofertas. Tente de novo.</p>
      ) : resultado.offers.length === 0 ? (
        <p>Nenhuma oferta encontrada para esse filtro.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr><th>Disciplina</th><th>Período</th><th>Sala</th><th>Professor</th><th>Dias</th><th /></tr>
              </thead>
              <tbody>
                {resultado.offers.map((o) => <OfferRow key={o.id} offer={o} />)}
              </tbody>
            </table>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" disabled={busca.page === 1}
                    onClick={() => setBusca({ ...busca, page: busca.page - 1 })}>Anterior</button>
            <span className="align-self-center">Página {busca.page}</span>
            <button type="button" className="btn btn-outline-secondary"
                    disabled={resultado.offers.length < resultado.pageSize}
                    onClick={() => setBusca({ ...busca, page: busca.page + 1 })}>Próxima</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageOffers;
