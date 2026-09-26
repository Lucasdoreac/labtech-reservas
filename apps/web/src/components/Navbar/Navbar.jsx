import "./Navbar.scss";
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../services/client';

const Navbar = () => {
    const navigate = useNavigate(); // useNavigate para alterar a URL
    const { pathname } = useLocation(); // relê a sessão a cada troca de tela (o login acontece em /auth/callback)
    const logado = Boolean(localStorage.getItem('token'));
    const [ofertas, setOfertas] = useState(false);

    // Link "Ofertas" só para quem o python-services autoriza (OFFER_ADMIN_EMAILS).
    useEffect(() => {
        let ativo = true;
        if (!logado) {
            setOfertas(false);
            return undefined;
        }
        apiService.getPermissions().then((p) => ativo && setOfertas(Boolean(p?.manageOffers)));
        return () => { ativo = false; };
    }, [logado, pathname]);

    // Sai só neste navegador: o auth_service não tem rota para revogar o token,
    // que continua válido no servidor até expirar (1 dia).
    const sair = () => {
        localStorage.clear();
        navigate('/organizer');
    };

    return (
        <nav id="nav">
            <div className="nav left">
        <span className="gradient skew">
          <h1 className="logo un-skew mt-4">
            <span onClick={() => navigate('/')}>LabTech UDF</span>
          </h1>
        </span>
                <button id="menu" className="btn-nav">
                    <span className="fas fa-bars"></span>
                </button>
            </div>
            <div className="nav right">
        <span className="nav-link active" onClick={() => navigate('/organizer')}>
          <span className="nav-link-span">
            <span className="u-nav">Organizador</span>
          </span>
        </span>
                {ofertas && (
                    <button type="button" className="nav-link btn btn-link" onClick={() => navigate('/ofertas')}>
                        <span className="nav-link-span">
                            <span className="u-nav">Ofertas</span>
                        </span>
                    </button>
                )}
                {logado && (
                    <button type="button" className="nav-link btn btn-link" onClick={sair}>
                        <span className="nav-link-span">
                            <span className="u-nav">Sair</span>
                        </span>
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
