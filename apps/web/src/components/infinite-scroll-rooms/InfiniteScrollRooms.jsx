import { useEffect, useState, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import apiService from '../../services/client';
import './InfiniteScrollRooms.scss';

const InfiniteScrollRooms = ({ date, time, onRoomSelect, userSearchInput = "" }) => {
  const [rooms, setRooms] = useState([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [hasMore, setHasMore] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // "Já carregando" em ref: como estado, fetchRooms mudaria a cada carga e o
  // efeito que a chama rodaria em laço.
  const loadingRef = useRef(false);
  const [error, setError] = useState(null);

  // Formata a data para o formato "YYYY-MM-DD"
  const formattedDate = date.toISOString().split('T')[0];

  // Use useCallback to prevent recreating this function on every render
  const fetchRooms = useCallback(async (currentPage = 1, resetData = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    if(resetData) setRooms([]);
    setError(null);
    try {
      const response = await apiService.getAvailableSlots(
        formattedDate, 
        time, 
        currentPage, 
        pageSize, 
        userSearchInput
      );
      
      if (response && response.data) {
        const newRooms = response.data;
        setRooms(prevRooms => resetData ? newRooms : [...prevRooms, ...newRooms]);

        // Atualiza a página e verifica se há mais dados com base na paginação
        if (currentPage >= response.pagination.total_pages) {
          setHasMore(false);
        } else {
          setPage(currentPage + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Erro ao buscar salas disponíveis:", error);
      setError(error.response.data.error);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [formattedDate, time, pageSize, userSearchInput]);
  
  useEffect(() => {
    setError(null);
  }, [userSearchInput]);

  // Reset and fetch initial data when search parameters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setSelectedRoomId(null);
    fetchRooms(1, true);
  }, [formattedDate, time, userSearchInput, fetchRooms]);

  // Function to load more data
  const loadMoreRooms = () => {
    if (!isLoading && hasMore) {
      fetchRooms(page, false);
      return;
    }
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
  };

    return (
    error ? (
      <div className="error-message">{error}</div>
    ) : (
      <InfiniteScroll
        dataLength={rooms.length}
        next={loadMoreRooms}
        hasMore={hasMore}
        loader={<h4>Carregando mais salas...</h4>}
        endMessage={<p>Você chegou ao fim da lista.</p>}
      >
        <div className="rooms-list">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${selectedRoomId === room.id ? "selected" : ""}`}
                onClick={() => handleSelectRoom(room.id)}
              >
                <h3>{room.name}</h3>
                <p>{room.campus}</p>
              </div>
            ))
          ) : (
            <p>Nenhuma sala encontrada.</p>
          )}
        </div>
      </InfiniteScroll>
    )
  );
};

export default InfiniteScrollRooms;