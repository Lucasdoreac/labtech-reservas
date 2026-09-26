import { useState } from "react";
import "./Organizer.scss";
import AvatarImage from "../../images/man.png";
import { AiOutlineLeft } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/client";

function Organizer() {
  const [email, setEmail] = useState(() => localStorage.getItem("email") || "");
  const [errors, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  // Só existe em desenvolvimento: o auth_service devolve o link em vez de
  // mandar email, e sem mostrá-lo aqui ninguém consegue entrar pela tela.
  const [devLink, setDevLink] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const sendEmail = async (event) => {
    event.preventDefault();
    if (validEmail()) {
      setLoading(true);
      localStorage.clear();
      localStorage.setItem("email", email); // Save email to localStorage
      const result = await apiService.postAuthMail(email);
      if (result?.magic_link) setDevLink(result.magic_link);
      else if (result) navigate("/auth/callback?email=" + email);
      else setErro("Serviço indisponível");
      setLoading(false);
    }
  };

  const validEmail = () => {
    if (!email.trim()) {
      setErro("O campo e-mail é obrigatório.");
      return false;
    }
    // Mesmo domínio que o auth_service aceita (qualquer outro volta 400).
    if (!/^[a-zA-Z0-9._%+-]+@udf\.edu\.br$/.test(email)) {
      setErro("O campo e-mail está fora do formato permitido.");
      return false;
    }
    return true;
  };

  return (
    <div>
      <div className="card-header">
        <div className="d-flex justify-content-start">
          <span onClick={() => navigate("/")}>
            <AiOutlineLeft
              size="20px"
              color="white"
              style={{ margin: "0px 10px 0px 0px" }}
            />
          </span>
          <h5>Voltar</h5>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-12 text-center">
            <img
              className="img-man mb-2"
              src={AvatarImage}
              style={{ width: "200px" }}
              alt="man avatar"
            />
            {/* <form>: Enter no campo envia (issue #34); antes só o clique no botão. */}
            <form onSubmit={sendEmail} noValidate>
            <input
              type="email"
              name="email"
              placeholder="Digite seu email@udf.edu.br"
              value={email}
              onChange={handleChange}
              className="form-control"
            />
            {errors && <span style={{ color: "red" }}>{errors}</span>}
            {devLink && (
              <div className="alert alert-warning mt-3 text-start" role="alert">
                <b>Ambiente de desenvolvimento:</b> nenhum email foi enviado.
                Entre pelo link abaixo.
                <div className="mt-2" style={{ wordBreak: "break-all" }}>
                  <a href={devLink}>{devLink}</a>
                </div>
              </div>
            )}
            <div className="mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                <b>{loading ? "Enviando..." : "Próximo"}</b>
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Organizer;
