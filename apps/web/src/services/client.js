import axios from "axios";

class ApiService {
  constructor() {
    this.http = axios.create({
      baseURL: import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
    });

    this.http.interceptors.request.use((config) => {
      // Add authorization header if available
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers.email = email;
        config.headers.token = token;
      }
      return config;
    });
  }

  async postAuthMail(email) {
    try {
      const response = await this.http.post("/auth/send-link", null, {
        params: { email },
      });
      localStorage.clear();
      localStorage.setItem("userEmail", email);
      // Corpo da resposta, não só "deu certo": em desenvolvimento o
      // auth_service devolve { magic_link } em vez de enviar email.
      return response.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async validateToken(token, email) {
    try {
      const params = new URLSearchParams({ token, email });
      const response = await this.http.get("/auth/validate", {
        params: params,
      });
      if (response.status === 200) return true;
      localStorage.clear();
      return false;
    } catch {
      localStorage.clear();
      return false;
    }
  }

  // Tela de ofertas (só quem está em OFFER_ADMIN_EMAILS no python-services).
  async getPermissions() {
    try {
      return (await this.http.get("/auth/permissions")).data;
    } catch {
      return { manageOffers: false };
    }
  }

  async getManagedOffers({ year, semester, discipline, page }) {
    try {
      const response = await this.http.get("/offers/manage", {
        params: { year, semester, discipline: discipline || undefined, page },
      });
      return { ok: true, ...response.data };
    } catch (error) {
      return { ok: false, status: error.response?.status };
    }
  }

  async setOfferWeekdays(offerId, weekdays) {
    try {
      const response = await this.http.put(`/offers/${offerId}/weekdays`, { weekdays });
      return { ok: true, weekdays: response.data.weekdays };
    } catch (error) {
      return { ok: false, status: error.response?.status };
    }
  }

  async getTypes() {
    try {
      const response = await this.http.get("/types");
      return response.data;
    } catch (error) {
      console.error("Erro ao obter dados:", error);
      return null;
    }
  }

  async searchCourses(query) {
    try {
      const response = await this.http.get("/courses", {
        params: { course_name: query },
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      return null;
    }
  }

  async getCourseById(courseId) {
    try {
      const response = await this.http.get("/courses", {
        params: { course_id: courseId },
      });
      if (response.status === 200) {
        // A rota devolve { course } (um curso) quando se passa course_id.
        return response.data.course;
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter curso:", error);
      return null;
    }
  }

  async submitEventData(data, status, eventId = null) {
    try {
      const requestData = { ...data, status };
      let response;
      // Update an event object
      if (eventId) {
        response = await this.http.put(`/events/${eventId}`, requestData);
      } else {
        // Create a new event object
        response = await this.http.post("/events", requestData);
      }
      return response.data.eventId;
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      throw error;
    }
  }

  async getUserEvents(userEmail) {
    try {
      const response = await this.http.get("/events", {
        params: { userEmail: userEmail },
      });
      if (response.status === 200) {
        return response.data;
      }
      return false;
    } catch {
      console.error();
      return false;
    }
  }

  async getEventsReservations(eventId) {
    try {
      const response = await this.http.get("/reservations", {
        params: { eventId },
      });
      if (response.status === 200) {
        let reservation = response.data;

        // Modify the date strings to change "GMT" to "GMT-3" before parsing
        if (reservation && reservation.startAt) {
          // Replace GMT with GMT-3 in the date strings
          const startAtString = reservation.startAt.replace(" GMT", " GMT-3");
          const endAtString = reservation.endAt.replace(" GMT", " GMT-3");

          // Now parse the modified strings to Date objects
          const startDate = new Date(startAtString);
          const endDate = new Date(endAtString);

          reservation = {
            ...reservation,
            startAt: startDate,
            endAt: endDate,
          };
        }
        return reservation;
      }
      return null;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      return null;
    }
  }

  async getAvailableSlots(
    formattedDate,
    time,
    page = 1,
    page_size = 10,
    roomName = ""
  ) {
    try {
      const params = {
        date: formattedDate,
        time: time,
        page,
        page_size,
      };

      if (roomName) {
        params.room_name = roomName;
      }

      const response = await this.http.get("/rooms/available-rooms", {
        params: params,
      });

      if (response.status === 200) {
        return response.data;
      }
      return false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Reserva a sala e envia o evento para aprovação numa requisição só (#64):
  // se o evento não gravar, o backend desfaz a reserva.
  async submitEvent(data, eventId) {
    try {
      const response = await this.http.post(`/events/${eventId}/submit`, data);
      return { ok: true, eventId: response.data.eventId };
    } catch (error) {
      console.error(error);
      return { ok: false, status: error.response?.status };
    }
  }


  async getRoomById(roomId) {
    try {
      const response = await this.http.get("/rooms", {
        params: { roomId },
      });
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao obter sala:", error);
      return null;
    }
  }
}

const apiService = new ApiService();
export default apiService;
