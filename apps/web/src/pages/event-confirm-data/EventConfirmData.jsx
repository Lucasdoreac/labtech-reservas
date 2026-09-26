import { useState } from "react";
import { AiOutlineLeft } from "react-icons/ai";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";
import apiService from "../../services/client";
import { summarizeEventData } from "../../utils/eventSummary";
import "./EventConfirmData.scss";

const EventConfirmData = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const { formData } = useFormContext();
  const [errors, setErrors] = useState({});

  const handleConfirm = async () => {
    if (!validateForm()) {
      return; // Stop execution if validation fails
    }

    const result = await apiService.submitEvent(formData, eventId);
    if (result.ok) {
      navigate(`/event/confirmation?eventId=${eventId}`);
      return;
    }
    const apiErrors = {
      409: "Enquanto você preenchia, outro evento reservou esta sala neste horário. Volte e escolha outro.",
      // a API recusa reserva no passado; o calendário não barra um horário que já passou hoje
      400: "A data ou o horário já passou, ou falta a sala. Volte à etapa Agenda e escolha de novo.",
    };
    setErrors({
      api: apiErrors[result.status] || "Falha ao enviar o evento. Tente novamente.",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      formData.classificacao === "lecture" ||
      formData.classificacao === "workshop"
    ) {
      if (
        !formData.numeroParticipantes?.trim() ||
        formData.numeroParticipantes <= 0
      ) {
        newErrors.numeroParticipantes =
          "Número de participantes é obrigatório.";
      }
      if (!formData.espacos?.trim()) {
        newErrors.espacos = "Selecione um espaço necessário.";
      }
      if (formData.trilha === "sim" && !formData.trilhaDesc?.trim()) {
        newErrors.trilhaDesc =
          "Descrição da trilha empreendedora é obrigatória.";
      }
      if (formData.projeto === "sim" && !formData.projetoDesc?.trim()) {
        newErrors.projetoDesc =
          "Descrição do projeto de extensão é obrigatória.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!formData) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div className="confirmar-dados-container">
      <div className="card-header">
        <span onClick={() => navigate(`/event/schedule?eventId=${eventId}`)}>
          <AiOutlineLeft
            size="20px"
            color="white"
            style={{ marginRight: 10 }}
          />
        </span>
      </div>
      <h2>Confirmar Dados do Evento</h2>
      <dl className="dados-preview">
        {summarizeEventData(formData).map(({ label, value }) => (
          <div key={label} className="dados-preview-item">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {/* UX-01: antes os erros iam para o estado e nunca apareciam. */}
      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger" role="alert">
          <ul className="mb-0">
            {Object.values(errors).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn btn-primary" onClick={handleConfirm}>
        Confirmar
      </button>
    </div>
  );
};

export default EventConfirmData;
