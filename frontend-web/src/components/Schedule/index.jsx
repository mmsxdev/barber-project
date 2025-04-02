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

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [barbers, setBarbers] = useState([]);
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
      const formattedEvents = response.data.map((s) => ({
        id: s.id,
        title: `${s.clientName} • ${s.service}`,
        start: parseISO(s.dateTime),
        end: new Date(parseISO(s.dateTime).getTime() + 60 * 60 * 1000),
        status: s.status,
        barber: s.barber?.name,
        extendedProps: {
          clientName: s.clientName,
          service: s.service,
          barberId: s.barberId,
          status: s.status,
        },
      }));
      setEvents(formattedEvents);
    } catch (error) {
      error && setError("Erro ao carregar agendamentos");
    }
  };

  useEffect(() => {
    fetchEvents();
    loadBarbers();
  }, [loadBarbers]);

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
    <div
      className={`p-6 min-h-screen ${
        isDarkMode ? "text-slate-200" : "text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
            Agenda de Serviços
          </h1>
          <p
            className={`text-sm mt-1 ${
              isDarkMode ? "text-slate-400" : "text-gray-600"
            }`}
          >
            {format(new Date(), "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Alertas - Updated to be fixed and float */}
      {(error || success) && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg border shadow-lg z-50 transition-opacity duration-300 ${
            error
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-green-500/10 border-green-500/20 text-green-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? "❌" : "✅"} {error || success}
          </div>
        </div>
      )}

      {/* Calendário - Adjusted width to full container */}
      <div
        className={`${
          isDarkMode ? "bg-slate-900 border-white" : "bg-white border-gray-200"
        } p-2 md:p-6 rounded-xl border shadow-lg w-full overflow-x-auto`}
      >
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
          height="calc(100vh - 200px)"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={true}
          allDayText="Dia inteiro"
          slotDuration="01:00:00"
          eventDurationEditable={true}
          eventOverlap={false}
          forceEventDuration={true}
          defaultTimedEventDuration="01:00:00"
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          expandRows={true}
          contentHeight="auto"
          eventContent={(eventInfo) => (
            <div className="flex flex-col p-1 sm:p-2">
              <div className="font-medium text-xs sm:text-sm">
                {eventInfo.event.title}
              </div>
              <div className="text-[10px] sm:text-xs opacity-75 mt-0.5 sm:mt-1">
                {eventInfo.event.extendedProps.barber}
              </div>
            </div>
          )}
          eventClassNames={(eventInfo) => {
            return eventInfo.event.extendedProps.status === "CONFIRMED"
              ? isDarkMode
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "bg-blue-500/10 border-blue-500 text-blue-600"
              : isDarkMode
              ? "bg-red-500/20 border-red-500 text-red-400"
              : "bg-red-500/10 border-red-500 text-red-600";
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            list: "Lista",
          }}
          buttonClassNames={
            isDarkMode
              ? "bg-slate-800 text-white hover:bg-slate-700 border-slate-700 text-xs sm:text-sm"
              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300 text-xs sm:text-sm"
          }
          dayCellClassNames={
            isDarkMode
              ? "text-white text-xs sm:text-sm"
              : "text-gray-700 text-xs sm:text-sm"
          }
          slotLabelClassNames={
            isDarkMode
              ? "text-white text-xs sm:text-sm"
              : "text-gray-700 text-xs sm:text-sm"
          }
          nowIndicatorClassNames={isDarkMode ? "bg-red-500" : "bg-red-600"}
          dayHeaderClassNames={`${
            isDarkMode ? "text-white" : "text-gray-700"
          } font-semibold text-xs sm:text-sm`}
          titleFormat={{ year: "numeric", month: "long" }}
          titleClassNames={`${
            isDarkMode ? "text-white" : "text-gray-900"
          } text-lg sm:text-xl font-bold`}
          customButtons={{}}
          views={{
            timeGridWeek: {
              slotLabelFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            },
          }}
          slotLabelContent={(args) => {
            return (
              <span className="px-1 sm:px-2 text-xs sm:text-sm">
                {args.text}
              </span>
            );
          }}
          allDayClassNames={
            isDarkMode
              ? "text-white bg-slate-800 text-xs sm:text-sm"
              : "text-gray-700 bg-gray-50 text-xs sm:text-sm"
          }
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
          <div
            className={`${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            } rounded-xl p-4 sm:p-6 w-full max-w-md border shadow-2xl`}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3
                className={`text-lg sm:text-xl font-semibold ${
                  isDarkMode ? "text-slate-100" : "text-gray-900"
                }`}
              >
                {selectedEvent ? "Editar Agendamento" : "Novo Agendamento"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEvent(null);
                }}
                className={
                  isDarkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-gray-500 hover:text-gray-700"
                }
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Cliente *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm sm:text-base ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Data/Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, dateTime: e.target.value })
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm sm:text-base ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Serviço *
                </label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm sm:text-base ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Barbeiro *
                </label>
                <select
                  value={formData.barberId}
                  onChange={(e) =>
                    setFormData({ ...formData, barberId: e.target.value })
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm sm:text-base ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
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
                <label
                  className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-sm sm:text-base ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base"
                >
                  {selectedEvent ? "Atualizar" : "Criar"}
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
