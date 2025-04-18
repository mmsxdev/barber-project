import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import api from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";
import { serviceService } from "../../services/businessServices";

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    clientName: "",
    dateTime: "",
    service: "",
    barberId: "",
    status: "CONFIRMED",
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadServices = useCallback(async () => {
    try {
      const data = await serviceService.list();
      setServices(data);
    } catch (error) {
      error && setError("Erro ao carregar serviços");
    }
  }, []);

  const loadBarbers = useCallback(async () => {
    try {
      const response = await api.get("/schedulings/barbers");
      setBarbers(response.data);
    } catch (error) {
      error && setError("Erro ao carregar barbeiros");
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/schedulings");
      
      // Se a resposta vier vazia (pode acontecer em caso de erro no backend)
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        console.log("Resposta vazia recebida:", response.data);
        setEvents([]);
        return;
      }
      
      const formattedEvents = response.data
        .filter(s => s && s.id && s.dateTime) // Garantir que só processamos dados válidos
        .map((s) => {
          try {
            // Garantir que temos valores seguros para exibição
            const clientName = s.clientName || (s.client?.name) || "Cliente sem nome";
            const serviceName = s.service?.name || (typeof s.service === 'string' ? s.service : "Serviço não identificado");
            const barberName = s.barber?.name || "Barbeiro não identificado";
            
            // Definir cores com base no status
            let bgColor, borderColor;

            switch (s.status) {
              case "CONFIRMED":
                bgColor = "#4ade80"; // verde
                borderColor = "#22c55e";
                break;
              case "PENDING":
                bgColor = "#facc15"; // amarelo
                borderColor = "#eab308";
                break;
              case "CANCELED":
                bgColor = "#f87171"; // vermelho
                borderColor = "#ef4444";
                break;
              default:
                bgColor = "#facc15"; // amarelo (default)
                borderColor = "#eab308";
            }

            // Garantir que a data é válida
            let startDate;
            try {
              startDate = s.dateTime ? parseISO(s.dateTime) : new Date();
              // Verificar se a data é válida
              if (isNaN(startDate.getTime())) {
                startDate = new Date();
              }
            } catch (dateError) {
              console.error("Erro ao processar data:", dateError);
              startDate = new Date();
            }

            return {
              id: s.id || Math.random().toString(36).substr(2, 9),
              title: `${clientName} • ${serviceName}`,
              start: startDate,
              end: new Date(startDate.getTime() + 60 * 60 * 1000),
              status: s.status || "PENDING",
              barber: barberName,
              backgroundColor: bgColor,
              borderColor: borderColor,
              extendedProps: {
                clientName,
                service: serviceName,
                barberId: s.barberId,
                status: s.status || "PENDING",
                barber: barberName,
              },
            };
          } catch (itemError) {
            console.error("Erro ao processar agendamento:", itemError, s);
            return null; // Pular este item
          }
        }).filter(event => event !== null); // Remover itens nulos
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      setError(
        error.response?.data?.error || 
        error.message || 
        "Erro ao carregar agendamentos. Tente novamente."
      );
      setEvents([]); // Limpar eventos em caso de erro
    }
  };

  useEffect(() => {
    fetchEvents();
    loadBarbers();
    loadServices();
  }, [loadBarbers, loadServices]);

  const handleDateSelect = (selectInfo) => {
    setFormData({
      clientName: "",
      dateTime: format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"),
      service: "",
      barberId: "",
      status: "CONFIRMED",
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setFormData({
      clientName: clickInfo.event.extendedProps.clientName,
      dateTime: format(clickInfo.event.start, "yyyy-MM-dd'T'HH:mm"),
      service: clickInfo.event.extendedProps.service,
      barberId: clickInfo.event.extendedProps.barberId,
      status: clickInfo.event.extendedProps.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await api.put(`/schedulings/${selectedEvent.id}`, formData);
        setSuccess("Agendamento atualizado!");
      } else {
        await api.post("/schedulings", formData);
        setSuccess("Agendamento criado!");
      }
      setIsModalOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (window.confirm("Tem certeza que deseja excluir este agendamento?")) {
      try {
        await api.delete(`/schedulings/${selectedEvent.id}`);
        setSuccess("Agendamento excluído!");
        setIsModalOpen(false);
        setSelectedEvent(null);
        fetchEvents();
      } catch (error) {
        setError(error.response?.data?.error || "Erro ao excluir");
      }
    }
  };

  return (
    <div className={`min-h-screen w-full ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <div className="max-w-[2000px] mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Agenda de Serviços
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-4 rounded-xl ${
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
            } border shadow-lg`}>
              <p className="text-sm text-slate-400 mb-1">Total</p>
              <p className="text-xl font-bold">{events.length}</p>
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
            } border shadow-lg`}>
              <p className="text-sm text-slate-400 mb-1">Confirmados</p>
              <p className="text-xl font-bold text-green-500">
                {events.filter(e => e.status === "CONFIRMED").length}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
            } border shadow-lg`}>
              <p className="text-sm text-slate-400 mb-1">Pendentes</p>
              <p className="text-xl font-bold text-yellow-500">
                {events.filter(e => e.status === "PENDING").length}
              </p>
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
            } border shadow-lg`}>
              <p className="text-sm text-slate-400 mb-1">Cancelados</p>
              <p className="text-xl font-bold text-red-500">
                {events.filter(e => e.status === "CANCELED").length}
              </p>
            </div>
          </div>
        </div>

        {/* Novo Agendamento Button */}
        <button
          onClick={() => {
            setFormData({
              clientName: "",
              dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
              service: "",
              barberId: "",
              status: "CONFIRMED",
            });
            setIsModalOpen(true);
          }}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircleIcon className="w-5 h-5" />
          <span className="font-medium">Novo Agendamento</span>
        </button>

        {/* Calendar */}
        <div className={`rounded-xl overflow-hidden border shadow-lg ${
          isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200"
        }`}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale={ptBrLocale}
            slotMinTime="08:00:00"
            slotMaxTime="19:00:00"
            allDaySlot={false}
            height="auto"
            contentHeight="auto"
            aspectRatio={1.5}
            expandRows={true}
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-0 sm:p-4 text-center sm:block">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)} />

            <div className={`relative w-full sm:max-w-lg mx-auto ${
              isDarkMode ? "bg-slate-800 text-white" : "bg-white text-gray-900"
            } rounded-t-xl sm:rounded-xl px-4 pb-4 pt-5 sm:p-6 overflow-hidden shadow-xl transform transition-all`}>
              <div className="absolute right-4 top-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-500"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-4 text-center">
                {selectedEvent ? "Editar Agendamento" : "Novo Agendamento"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTime: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Serviço
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Selecione um serviço</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Barbeiro
                  </label>
                  <select
                    value={formData.barberId}
                    onChange={(e) =>
                      setFormData({ ...formData, barberId: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="">Selecione um barbeiro</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  >
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="PENDING">Pendente</option>
                    <option value="CANCELED">Cancelado</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                  >
                    {selectedEvent ? "Atualizar" : "Criar"}
                  </button>
                  {selectedEvent && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {(error || success) && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg border z-50 ${
            error
              ? "bg-red-500/10 border-red-500/20 text-red-300"
              : "bg-green-500/10 border-green-500/20 text-green-300"
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            {error ? "❌" : "✅"} {error || success}
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
