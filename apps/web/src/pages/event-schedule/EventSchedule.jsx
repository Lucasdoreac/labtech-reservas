import { useState } from "react";
import { AiOutlineLeft, AiOutlineSearch } from "react-icons/ai";
import DatePickerComponent from "../../components/date-picker/DatePickerComponent";
import InfiniteScrollRooms from "../../components/infinite-scroll-rooms/InfiniteScrollRooms";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormContext } from "../../context/FormContext";
import {
  PERIOD_TO_TIME,
  atPeriod,
  firstAvailableSlot,
  firstPeriodOf,
  isPastSlot,
} from "../../utils/schedule";
import "./EventSchedule.scss";

const PERIOD_LABELS = { Manha: "Manhã", Tarde: "Tarde", Noite: "Noite" };

const EventSchedule = () => {
  // Abre no primeiro período que ainda não começou (antes: sempre hoje 08:00,
  // que depois das 8h a API recusa como horário passado).
  const [initialSlot] = useState(() => firstAvailableSlot());
  const [selectedDate, setSelectedDate] = useState(initialSlot.date);
  const [selectedPeriod, setSelectedPeriod] = useState(initialSlot.period);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Pego o eventId e a classificação (tipo de evento) do contexto do formulário
  const { handleRoomDataChange, formData } = useFormContext();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get("eventId");

  const selectedTime = PERIOD_TO_TIME[selectedPeriod];

  // Troca de dia mantém o período; se ele já passou nesse dia (hoje), vai
  // para o primeiro que ainda não começou.
  const handleDateChange = (date) => {
    if (!date) return;
    const period = isPastSlot(date, selectedPeriod) ? firstPeriodOf(date) : selectedPeriod;
    if (!period) {
      const slot = firstAvailableSlot();
      setSelectedPeriod(slot.period);
      setSelectedDate(slot.date);
      return;
    }
    setSelectedPeriod(period);
    setSelectedDate(atPeriod(date, period));
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
    setSelectedDate((current) => atPeriod(current, e.target.value));
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    handleRoomDataChange(roomId, selectedDate, eventId);
  };

  const handleContinue = () => {
    navigate(`/event/confirm-data?eventId=${eventId}`);
  };

  // Função para lidar com o botão voltar com lógica condicional
  const handleGoBack = () => {
    // Verifica o tipo do evento atual
    const eventType = formData.classificacao;

    if (eventType === "class" || eventType === "exam") {
      // Se for aula ou exame, volta para a tela de seleção de tipo
      navigate(`/event/type-selection${eventId ? `?eventId=${eventId}` : ""}`);
    } else {
      // Caso contrário, mantém o comportamento original
      navigate(`/event/logistics${eventId ? `?eventId=${eventId}` : ""}`);
    }
  };

  // Debounce para a busca
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce para evitar muitas requisições durante a digitação
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setDebouncedQuery(value);
    }, 500);
  };

  return (
    <div className="escolha-horario-container">
      <div className="card-header">
        {/* Substitui a navegação direta por um handler condicional */}
        <span onClick={handleGoBack}>
          <AiOutlineLeft
            size="20px"
            color="white"
            style={{ marginRight: 10 }}
          />
        </span>
      </div>
      <div className="header-container">
        <h2>Escolha o Dia e Horário</h2>
        <DatePickerComponent
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
        <div className="period-selection">
          <p>Selecione o período:</p>
          {Object.keys(PERIOD_TO_TIME).map((period) => (
            <label key={period}>
              <input
                type="radio"
                value={period}
                checked={selectedPeriod === period}
                disabled={isPastSlot(selectedDate, period)}
                onChange={handlePeriodChange}
              />
              {PERIOD_LABELS[period]}
            </label>
          ))}
        </div>
        {selectedRoom && (
          <div className="continue-button-containers">
            <button
              className="btn btn-primary continue-button"
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        )}
      </div>

      <div className="scroll-container">
        {selectedPeriod && (
          <>
            <h3>
              Salas disponíveis para {selectedDate.toLocaleDateString()} às{" "}
              {selectedTime}:
            </h3>

            {/* Barra de pesquisa */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <AiOutlineSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Pesquisar salas por nome..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
            </div>

            <InfiniteScrollRooms
              date={selectedDate}
              time={selectedTime}
              onRoomSelect={handleRoomSelect}
              userSearchInput={debouncedQuery}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EventSchedule;
