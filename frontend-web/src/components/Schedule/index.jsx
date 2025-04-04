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
      const formattedEvents = response.data.map((s) => {
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

        return {
          id: s.id,
          title: `${s.clientName} • ${s.service}`,
          start: parseISO(s.dateTime),
          end: new Date(parseISO(s.dateTime).getTime() + 60 * 60 * 1000),
          status: s.status,
          barber: s.barber?.name,
          backgroundColor: bgColor,
          borderColor: borderColor,
          extendedProps: {
            clientName: s.clientName,
            service: s.service,
            barberId: s.barberId,
            status: s.status,
            barber: s.barber?.name,
          },
        };
      });
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
    <div className="w-full h-full flex flex-col">
      <style>
        {`
          .fc-button {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 0.375rem;
            transition: all 0.2s;
            background-color: ${isDarkMode ? "#1e293b" : "#ffffff"} !important;
            border-color: ${isDarkMode ? "#334155" : "#d1d5db"} !important;
            color: ${isDarkMode ? "#ffffff" : "#374151"} !important;
          }
          .fc-button:hover {
            background-color: ${isDarkMode ? "#334155" : "#f3f4f6"} !important;
          }
          .fc-button-active {
            background-color: ${isDarkMode ? "#334155" : "#f3f4f6"} !important;
            border-color: ${isDarkMode ? "#475569" : "#9ca3af"} !important;
          }
          .fc-toolbar-title {
            font-size: 0.875rem;
            font-weight: 700;
            color: ${isDarkMode ? "#ffffff" : "#111827"};
          }
          .fc-toolbar {
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 0.5rem;
          }
          .fc-toolbar-chunk {
            display: flex;
            gap: 0.25rem;
            flex-wrap: wrap;
          }
          .fc-daygrid-day {
            transition: background-color 0.2s;
          }
          .fc-daygrid-day:hover {
            background-color: ${
              isDarkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(243, 244, 246, 0.7)"
            };
          }
          .fc-daygrid-day-frame {
            padding: 4px !important;
          }
          .fc-scrollgrid-sync-inner {
            padding: 6px 0;
          }
          .fc-col-header-cell {
            padding: 8px 0 !important;
            background-color: ${
              isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(243, 244, 246, 0.7)"
            };
          }
          .fc-timegrid-slot {
            height: 35px !important;
            border-bottom: 1px solid ${
              isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.07)"
            } !important;
          }
          .fc-timegrid-slot-lane {
            transition: background-color 0.2s;
          }
          .fc-timegrid-slot-lane:hover {
            background-color: ${
              isDarkMode ? "rgba(30, 41, 59, 0.5)" : "rgba(243, 244, 246, 0.7)"
            };
          }
          .fc-timegrid-now-indicator-line {
            border-color: ${isDarkMode ? "#ef4444" : "#dc2626"} !important;
            border-width: 2px;
          }
          .fc-day-today {
            background-color: ${
              isDarkMode
                ? "rgba(59, 130, 246, 0.15)"
                : "rgba(59, 130, 246, 0.08)"
            } !important;
          }
          .fc-event {
            cursor: pointer;
            overflow: hidden;
            margin: 1px 0 !important;
          }
          .fc-event:hover {
            z-index: 5 !important;
          }
          .fc-event-main {
            padding: 0 !important;
          }
          
          /* Melhorias para mobile */
          @media (max-width: 639px) {
            .fc-header-toolbar {
              flex-direction: column;
              align-items: center;
              gap: 8px;
            }
            
            .fc-toolbar-chunk {
              margin-bottom: 4px;
              width: 100%;
              justify-content: center;
            }
            
            .fc-button {
              font-size: 0.8rem;
              padding: 0.5rem 0.75rem;
              height: 40px;
              min-width: 40px;
            }
            
            .fc-col-header-cell-cushion {
              font-size: 0.7rem;
            }
            
            .fc-timegrid-axis-cushion, 
            .fc-timegrid-slot-label-cushion {
              font-size: 0.7rem;
            }
            
            .fc-timegrid-event {
              min-height: 50px !important;
            }
            
            .fc-timegrid-slot {
              height: 45px !important;
            }
            
            .fc-view-harness {
              height: auto !important;
              min-height: 500px;
            }
            
            .fc-daygrid-day-number {
              font-size: 0.8rem;
              padding: 6px;
            }
            
            .fc-daygrid-event {
              margin-top: 3px !important;
            }
            
            /* Fix para botões mais clicáveis no mobile */
            .fc-button-group {
              gap: 4px;
            }
            
            .fc-today-button {
              margin: 0 4px !important;
              height: 40px;
            }
          }
          
          @media (min-width: 640px) {
            .fc-button {
              font-size: 0.875rem;
              padding: 0.375rem 0.75rem;
            }
            .fc-toolbar-title {
              font-size: 1rem;
            }
            .fc-toolbar {
              gap: 1rem;
              padding: 1rem;
            }
            .fc-toolbar-chunk {
              gap: 0.5rem;
            }
          }
          @media (min-width: 1024px) {
            .fc-toolbar-title {
              font-size: 1.125rem;
            }
          }
        `}
      </style>
      <div className="flex-1 overflow-hidden">
        <div
          className={`p-1 sm:p-4 md:p-6 min-h-screen w-full overflow-x-hidden ${
            isDarkMode ? "text-slate-200" : "text-gray-900"
          }`}
        >
          <div className="max-w-[2000px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-4 md:mb-6">
              <div className="mb-2 sm:mb-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
                  Agenda de Serviços
                </h1>
                <p
                  className={`text-xs sm:text-sm mt-0.5 ${
                    isDarkMode ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  {format(new Date(), "MMMM yyyy", { locale: ptBR })}
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto justify-center text-xs sm:text-sm font-medium"
                >
                  <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Novo Agendamento
                </button>
              </div>
            </div>

            {/* Alertas */}
            {(error || success) && (
              <div
                className={`fixed top-4 right-2 sm:right-4 p-2.5 sm:p-4 rounded-lg border shadow-lg z-50 transition-opacity duration-300 ${
                  error
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-green-500/10 border-green-500/20 text-green-500"
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  {error ? "❌" : "✅"} {error || success}
                </div>
              </div>
            )}

            {/* Resumo de Agendamentos */}
            <div
              className={`mt-4 mb-6 sm:mt-5 sm:mb-6 rounded-xl border shadow-lg ${
                isDarkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-wrap lg:flex-nowrap items-center p-2 sm:p-3">
                <div className="px-2 py-1 sm:py-1.5 flex items-center">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isDarkMode ? "text-slate-300" : "text-gray-700"
                    }`}
                  >
                    Resumo:
                  </span>
                </div>
                <div className="flex flex-wrap lg:flex-nowrap flex-1 gap-2 sm:gap-3">
                  <div
                    className={`flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${
                      isDarkMode ? "bg-slate-800/70" : "bg-gray-50/80"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Total:
                    </div>
                    <div
                      className={`text-xs font-semibold ml-1 ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {events.length}
                    </div>
                  </div>
                  <div
                    className={`flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${
                      isDarkMode ? "bg-slate-800/70" : "bg-gray-50/80"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Confirmados:
                    </div>
                    <div
                      className={`text-xs font-semibold ml-1 text-green-500`}
                    >
                      {
                        events.filter(
                          (e) => e.extendedProps.status === "CONFIRMED"
                        ).length
                      }
                    </div>
                  </div>
                  <div
                    className={`flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${
                      isDarkMode ? "bg-slate-800/70" : "bg-gray-50/80"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Pendentes:
                    </div>
                    <div
                      className={`text-xs font-semibold ml-1 text-yellow-500`}
                    >
                      {
                        events.filter(
                          (e) => e.extendedProps.status === "PENDING"
                        ).length
                      }
                    </div>
                  </div>
                  <div
                    className={`flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${
                      isDarkMode ? "bg-slate-800/70" : "bg-gray-50/80"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Cancelados:
                    </div>
                    <div className={`text-xs font-semibold ml-1 text-red-500`}>
                      {
                        events.filter(
                          (e) => e.extendedProps.status === "CANCELED"
                        ).length
                      }
                    </div>
                  </div>
                  <div
                    className={`flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 ${
                      isDarkMode ? "bg-slate-800/70" : "bg-gray-50/80"
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Próx. 7 dias:
                    </div>
                    <div
                      className={`text-xs font-semibold ml-1 ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {
                        events.filter((e) => {
                          const eventDate = new Date(e.start);
                          const today = new Date();
                          const sevenDaysFromNow = new Date(
                            today.setDate(today.getDate() + 7)
                          );
                          return (
                            eventDate >= new Date() &&
                            eventDate <= sevenDaysFromNow
                          );
                        }).length
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendário */}
            <div
              className={`${
                isDarkMode
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-gray-200"
              } p-0.5 sm:p-2 md:p-4 rounded-xl border shadow-lg w-full overflow-x-auto`}
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
                height={{ mobile: "auto", default: "calc(100vh - 200px)" }}
                slotMinTime="08:00:00"
                slotMaxTime="19:00:00"
                allDaySlot={true}
                allDayText="Dia inteiro"
                slotDuration="00:30:00"
                slotLabelInterval="00:30"
                slotHeight={40}
                eventDurationEditable={true}
                eventOverlap={false}
                forceEventDuration={true}
                defaultTimedEventDuration="00:30:00"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  meridiem: false,
                }}
                expandRows={true}
                contentHeight="auto"
                nowIndicator={true}
                dayMaxEventRows={4}
                moreLinkClick="popover"
                eventContent={(eventInfo) => {
                  // Determinar se o evento é na visualização de mês ou semana/dia
                  const isMonthView = eventInfo.view.type === "dayGridMonth";
                  const isMobile = window.innerWidth < 640;

                  // Renderização simplificada para visualização mensal
                  if (isMonthView) {
                    return (
                      <div className="flex items-center p-1 h-full min-h-[20px] gap-1 rounded">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            eventInfo.event.extendedProps.status === "CONFIRMED"
                              ? "bg-green-500"
                              : eventInfo.event.extendedProps.status ===
                                "CANCELED"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <div className="font-medium text-[10px] truncate">
                          {eventInfo.event.extendedProps.clientName}
                        </div>
                      </div>
                    );
                  }

                  // Versão simplificada para mobile em visualização semanal
                  if (isMobile && !isMonthView) {
                    return (
                      <div className="p-1 h-full flex flex-col justify-center">
                        <div
                          className={`w-full h-1 rounded-full mb-1 ${
                            eventInfo.event.extendedProps.status === "CONFIRMED"
                              ? "bg-green-500"
                              : eventInfo.event.extendedProps.status ===
                                "CANCELED"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <div className="font-medium text-[10px] leading-tight truncate">
                          {eventInfo.event.extendedProps.clientName}
                        </div>
                        <div className="text-[8px] opacity-80 truncate">
                          {eventInfo.event.extendedProps.service}
                        </div>
                      </div>
                    );
                  }

                  // Renderização completa para visualização semanal/diária em desktop
                  return (
                    <div className="flex flex-col p-2 h-full min-h-[50px] rounded-lg overflow-hidden relative backdrop-blur-sm">
                      {/* Faixa de status no topo do evento */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${
                          eventInfo.event.extendedProps.status === "CONFIRMED"
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : eventInfo.event.extendedProps.status ===
                              "CANCELED"
                            ? "bg-gradient-to-r from-red-400 to-red-600"
                            : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        }`}
                      ></div>

                      {/* Hora do evento */}
                      <div className="flex items-center gap-1 pt-1 mb-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-2.5 h-2.5 opacity-70"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-[8px] font-medium opacity-90">
                          {format(eventInfo.event.start, "HH:mm")} -{" "}
                          {format(eventInfo.event.end, "HH:mm")}
                        </span>
                      </div>

                      {/* Conteúdo principal */}
                      <div className="flex-1 flex flex-col">
                        <div className="font-bold text-[11px] sm:text-sm truncate">
                          {eventInfo.event.extendedProps.clientName}
                        </div>

                        <div className="flex items-center mt-1 gap-1">
                          <div className="w-2 h-2 rounded-full bg-current opacity-80"></div>
                          <div className="text-[9px] sm:text-xs font-medium truncate">
                            {eventInfo.event.extendedProps.service}
                          </div>
                        </div>

                        <div className="flex items-center mt-1.5 gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-2.5 h-2.5 opacity-70"
                          >
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                          </svg>
                          <div className="text-[8px] sm:text-[10px] opacity-80 truncate">
                            {eventInfo.event.extendedProps.barber}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
                eventClassNames={(eventInfo) => {
                  // Classes base diferentes para visualização mensal vs semanal/diária
                  const isMonthView = eventInfo.view.type === "dayGridMonth";

                  const baseClasses = isMonthView
                    ? "shadow-sm hover:shadow-md transition-all duration-200"
                    : "shadow-lg hover:shadow-xl transition-all duration-300";

                  // Classes específicas para cada status
                  const statusClasses =
                    eventInfo.event.extendedProps.status === "CONFIRMED"
                      ? isDarkMode
                        ? isMonthView
                          ? "bg-green-900/80 text-green-50 border border-green-700"
                          : "bg-gradient-to-br from-green-900/90 to-green-800/90 border-l-4 border-l-green-400 text-green-50"
                        : isMonthView
                        ? "bg-green-100 text-green-900 border border-green-300"
                        : "bg-gradient-to-br from-green-50 to-green-100/90 border-l-4 border-l-green-500 text-green-900"
                      : eventInfo.event.extendedProps.status === "CANCELED"
                      ? isDarkMode
                        ? isMonthView
                          ? "bg-red-900/80 text-red-50 border border-red-700"
                          : "bg-gradient-to-br from-red-900/90 to-red-800/90 border-l-4 border-l-red-400 text-red-50"
                        : isMonthView
                        ? "bg-red-100 text-red-900 border border-red-300"
                        : "bg-gradient-to-br from-red-50 to-red-100/90 border-l-4 border-l-red-500 text-red-900"
                      : isDarkMode
                      ? isMonthView
                        ? "bg-yellow-900/80 text-yellow-50 border border-yellow-700"
                        : "bg-gradient-to-br from-yellow-900/90 to-yellow-800/90 border-l-4 border-l-yellow-400 text-yellow-50"
                      : isMonthView
                      ? "bg-yellow-100 text-yellow-900 border border-yellow-300"
                      : "bg-gradient-to-br from-yellow-50 to-yellow-100/90 border-l-4 border-l-yellow-500 text-yellow-900";

                  return `${baseClasses} ${statusClasses}`;
                }}
                slotEventOverlap={false}
                eventMinHeight={50}
                eventMaxStack={3}
                eventDisplay="block"
                eventDidMount={(info) => {
                  // Ajusta a altura do evento baseado no conteúdo
                  const eventEl = info.el;
                  const contentEl = eventEl.querySelector(".fc-event-main");
                  if (contentEl) {
                    const contentHeight = contentEl.scrollHeight;
                    eventEl.style.height = `${Math.max(
                      50,
                      contentHeight + 4
                    )}px`;
                  }
                }}
              />
            </div>

            {/* Mobile helper text */}
            <div className="block sm:hidden mt-4 text-center">
              <p
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-gray-600"
                }`}
              >
                Toque em um horário para agendar ou em um evento para editar
              </p>
            </div>

            {/* Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
                <div
                  className={`${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                  } rounded-xl p-2.5 sm:p-4 md:p-6 w-full max-w-md border shadow-2xl`}
                >
                  <div className="flex justify-between items-center mb-2.5 sm:mb-4">
                    <h3
                      className={`text-sm sm:text-lg font-semibold ${
                        isDarkMode ? "text-slate-100" : "text-gray-900"
                      }`}
                    >
                      {selectedEvent
                        ? "Editar Agendamento"
                        : "Novo Agendamento"}
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

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-2 sm:space-y-3"
                  >
                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
                          isDarkMode ? "text-slate-300" : "text-gray-700"
                        }`}
                      >
                        Cliente *
                      </label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-xs sm:text-sm ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
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
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-xs sm:text-sm ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
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
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-xs sm:text-sm ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
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
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-xs sm:text-sm ${
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
                        className={`block text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${
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
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 text-xs sm:text-sm ${
                          isDarkMode
                            ? "bg-slate-700 border-slate-600 text-slate-100"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                        required
                      >
                        <option value="CONFIRMED">Confirmado</option>
                        <option value="PENDING">Pendente</option>
                        <option value="CANCELED">Cancelado</option>
                      </select>
                    </div>

                    <div className="flex gap-2 sm:gap-3 mt-2.5 sm:mt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
                      >
                        {selectedEvent ? "Atualizar" : "Criar"}
                      </button>
                      {selectedEvent && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm"
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
        </div>
      </div>
    </div>
  );
};

export default Schedule;
