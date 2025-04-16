import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { format, parseISO, addHours, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Scissors,
  ArrowLeft,
  Calendar,
  User,
  Phone,
  X,
  Clock,
} from "lucide-react";
import { publicApi } from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";

const ClientScheduling = () => {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableHours, setAvailableHours] = useState([]);
  const [selectedModalDate, setSelectedModalDate] = useState(null);
  const [selectedModalHour, setSelectedModalHour] = useState(null);

  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    dateTime: "",
    service: "",
    barberId: "",
  });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchServices = async () => {
    try {
      const response = await publicApi.get("/public/scheduling/services");
      setServices(response.data);
    } catch (error) {
      setError("Não foi possível carregar a lista de serviços.");
      console.error(error);
    }
  };

  const fetchBarbers = async () => {
    try {
      const response = await publicApi.get("/public/scheduling/barbers");
      setBarbers(response.data);
    } catch {
      setError("Não foi possível carregar a lista de barbeiros.");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await publicApi.get("/public/scheduling/slots");
      const formattedEvents = response.data.map((s) => {
        let bgColor, borderColor;

        switch (s.status) {
          case "CONFIRMED":
            bgColor = "#4ade80";
            borderColor = "#22c55e";
            break;
          case "PENDING":
            bgColor = "#facc15";
            borderColor = "#eab308";
            break;
          case "CANCELED":
            bgColor = "#f87171";
            borderColor = "#ef4444";
            break;
          default:
            bgColor = "#facc15";
        }

        return {
          id: s.id,
          title:
            s.status === "CONFIRMED"
              ? "Confirmado"
              : s.status === "CANCELED"
              ? "Cancelado"
              : "Pendente",
          start: parseISO(s.dateTime),
          end: addHours(parseISO(s.dateTime), 1),
          backgroundColor: bgColor,
          borderColor: borderColor,
          display: "block",
          extendedProps: {
            barberId: s.barberId,
          },
        };
      });
      setAllEvents(formattedEvents);
      setEvents(
        formattedEvents.filter(
          (event) => event.extendedProps.barberId === formData.barberId
        )
      );
    } catch {
      setError("Não foi possível carregar os horários.");
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchServices();
    fetchEvents();
  }, [formData.barberId]);

  const handleDateSelect = (selectInfo) => {
    const now = new Date();
    if (selectInfo.start < now) {
      setError("Não é possível agendar em datas passadas.");
      return;
    }

    const hour = selectInfo.start.getHours();
    if (hour < 8 || hour >= 19) {
      setError("Horários disponíveis apenas das 8h às 19h.");
      return;
    }

    if (selectInfo.start.getDay() === 0) {
      setError("Não realizamos agendamentos aos domingos.");
      return;
    }

    const hasConflict = allEvents.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        event.extendedProps.barberId === formData.barberId &&
        selectInfo.start >= eventStart &&
        selectInfo.start < eventEnd
      );
    });

    if (hasConflict) {
      setError("Este barbeiro já possui agendamento neste horário.");
      return;
    }

    setSelectedDate(selectInfo.start);
    setFormData({
      ...formData,
      dateTime: format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"),
    });
    setStep(4);
  };

  const handleServiceSelect = (service) => {
    setFormData({
      ...formData,
      service: service.name,
    });
    setStep(2);
  };

  const handleBarberSelect = (barber) => {
    setFormData({
      ...formData,
      barberId: barber.id,
    });
    setStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.clientName || !formData.phone || !formData.dateTime) {
        setError("Preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
      }

      // Validar formato do telefone - deve ter pelo menos 10 dígitos
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        setError("Número de telefone inválido. Digite DDD + número.");
        setIsLoading(false);
        return;
      }

      // Validar a data - não pode ser no passado
      const selectedDate = new Date(formData.dateTime);
      if (selectedDate < new Date()) {
        setError("A data e hora selecionadas já passaram. Escolha uma data futura.");
        setIsLoading(false);
        return;
      }

      const response = await publicApi.post("/public/scheduling/appointments", formData);
      setSuccess(response.data.message || "Agendamento realizado com sucesso!");
      setStep(5);
    } catch (err) {
      console.error("Erro ao agendar:", err);
      
      // Exibe a mensagem de erro retornada pela API ou uma mensagem padrão
      const errorMsg = err.response?.data?.error || 
                      "Ocorreu um erro ao realizar o agendamento. Tente novamente.";
      
      setError(errorMsg);
      
      // Se o erro for relacionado ao serviço, volta para a seleção de serviços
      if (errorMsg.toLowerCase().includes("serviço")) {
        setStep(1);
      }
      // Se o erro for relacionado ao barbeiro, volta para a seleção de barbeiros
      else if (errorMsg.toLowerCase().includes("barbeiro") || errorMsg.toLowerCase().includes("profissional")) {
        setStep(2);
      }
      // Se o erro for relacionado ao horário, volta para a seleção de horário
      else if (errorMsg.toLowerCase().includes("horário") || errorMsg.toLowerCase().includes("agendamento")) {
        setStep(3);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      phone: "",
      dateTime: "",
      service: "",
      barberId: "",
    });
    setSelectedDate(null);
    setStep(1);
  };

  useEffect(() => {
    if (dateModalOpen) {
      const dates = [];
      const today = new Date();

      for (let i = 0; i < 14; i++) {
        const date = addDays(today, i);
        if (date.getDay() !== 0) {
          dates.push(date);
        }
      }

      setAvailableDates(dates);
      setSelectedModalDate(dates[0]);
      generateHoursForDate(dates[0]);
    }
  }, [dateModalOpen]);

  const generateHoursForDate = (date) => {
    const hours = [];
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    let startHour = 8;
    let startMinute = 0;

    if (isToday) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      if (currentHour >= 8) {
        startHour = currentHour;
        startMinute = currentMinute >= 30 ? 0 : 30;

        if (currentMinute >= 30) {
          startHour += 1;
          startMinute = 0;
        }
      }
    }

    for (let hour = startHour; hour <= 18; hour++) {
      for (
        let minute = hour === startHour ? startMinute : 0;
        minute < 60;
        minute += 30
      ) {
        if (hour === 18 && minute === 30) break;

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        hours.push(timeString);
      }
    }

    const availableSlots = hours.filter((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

      return !allEvents.some((event) => {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        return (
          event.extendedProps.barberId === formData.barberId &&
          slotStart < eventEnd &&
          slotEnd > eventStart
        );
      });
    });

    setAvailableHours(availableSlots);
    setSelectedModalHour(availableSlots[0] || null);
  };

  const handleDateModalSelect = (date) => {
    setSelectedModalDate(date);
    generateHoursForDate(date);
  };

  const handleConfirmDateTime = () => {
    if (!selectedModalDate || !selectedModalHour) return;

    const [hour, minute] = selectedModalHour.split(":").map(Number);
    const dateTime = new Date(selectedModalDate);
    dateTime.setHours(hour, minute, 0, 0);

    const isAvailable = !allEvents.some((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return (
        event.extendedProps.barberId === formData.barberId &&
        dateTime >= eventStart &&
        dateTime < eventEnd
      );
    });

    if (!isAvailable) {
      setError("Horário indisponível. Por favor selecione outro.");
      return;
    }

    setSelectedDate(dateTime);
    setFormData({
      ...formData,
      dateTime: format(dateTime, "yyyy-MM-dd'T'HH:mm"),
    });
    setDateModalOpen(false);
    setStep(4);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= i
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i}
            </div>
            {i < 4 && (
              <div
                className={`w-12 h-1 ${
                  step > i
                    ? "bg-blue-500"
                    : isDarkMode
                    ? "bg-slate-700"
                    : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          : "bg-gradient-to-br from-white to-gray-100 text-gray-900"
      }`}
    >
      <header
        className={`p-4 shadow-md ${
          isDarkMode ? "bg-slate-800/80" : "bg-white/80"
        } backdrop-blur-lg`}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
          >
            <Scissors className="text-blue-500" size={24} />
            Barbearia Style
          </Link>
          <Link
            to="/"
            className={`flex items-center gap-1 text-sm ${
              isDarkMode ? "text-slate-300" : "text-gray-600"
            } hover:underline`}
          >
            <ArrowLeft size={16} />
            Voltar para o site
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Agendamento Online
        </h1>

        {step < 5 && renderStepIndicator()}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500 text-center">
            {success}
          </div>
        )}

        <div
          className={`max-w-3xl mx-auto ${
            isDarkMode ? "bg-slate-800/50" : "bg-white"
          } rounded-xl shadow-xl backdrop-blur-lg p-6`}
        >
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Escolha um serviço
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`p-4 ${
                      isDarkMode
                        ? "bg-slate-700/50 hover:bg-slate-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    } rounded-lg cursor-pointer transition-colors border ${
                      isDarkMode ? "border-slate-600" : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-medium text-lg">{service.name}</h3>
                    <p className="text-sm mt-1">
                      <span className="font-semibold text-blue-500">
                        R$ {service.price.toFixed(2)}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className={`mb-4 flex items-center gap-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                } hover:underline`}
              >
                <ArrowLeft size={16} />
                Voltar para serviços
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Escolha um profissional
              </h2>
              {barbers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber)}
                      className={`p-4 ${
                        isDarkMode
                          ? "bg-slate-700/50 hover:bg-slate-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      } rounded-lg cursor-pointer transition-colors border ${
                        isDarkMode ? "border-slate-600" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isDarkMode ? "bg-slate-600" : "bg-gray-200"
                          }`}
                        >
                          <User size={24} className="text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{barber.name}</h3>
                          <p className="text-sm">Barbeiro</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center">Carregando profissionais...</p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                className={`mb-4 flex items-center gap-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                } hover:underline`}
              >
                <ArrowLeft size={16} />
                Voltar para profissionais
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Escolha uma data e horário
              </h2>

              <div className="mb-6 flex justify-center">
                <button
                  onClick={() => setDateModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-purple-600 flex items-center justify-center gap-2 transition-all"
                >
                  <Calendar size={20} />
                  Selecionar Data e Hora
                </button>
              </div>

              <div>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek",
                  }}
                  height="auto"
                  slotMinTime="08:00:00"
                  slotMaxTime="19:00:00"
                  allDaySlot={false}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events.filter(
                    (event) =>
                      event.extendedProps.barberId === formData.barberId
                  )}
                  locale={ptBrLocale}
                  select={handleDateSelect}
                  slotDuration="00:30:00"
                  slotLabelInterval="00:30"
                  defaultTimedEventDuration="00:30:00"
                  eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    meridiem: false,
                  }}
                  slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }}
                />
                <style>
                  {`
                    .fc-col-header-cell {
                      background-color: ${
                        isDarkMode ? "#1e293b" : "#f3f4f6"
                      } !important;
                    }
                    .fc-col-header-cell-cushion {
                      color: ${isDarkMode ? "#e2e8f0" : "#1f2937"} !important;
                    }
                    .fc-timegrid-axis-cushion,
                    .fc-timegrid-slot-label-cushion {
                      color: ${isDarkMode ? "#e2e8f0" : "#1f2937"} !important;
                    }
                    .fc-theme-standard td, 
                    .fc-theme-standard th {
                      border-color: ${
                        isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)"
                      } !important;
                    }
                    .fc-timegrid-slot {
                      height: 40px !important;
                    }
                    
                    @media (max-width: 767px) {
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
                        font-size: 0.75rem;
                      }
                      
                      .fc-timegrid-axis-cushion, 
                      .fc-timegrid-slot-label-cushion {
                        font-size: 0.7rem;
                      }
                      
                      .fc-timegrid-slot {
                        height: 50px !important;
                      }
                      
                      .fc-view-harness {
                        height: auto !important;
                        min-height: 450px;
                      }
                      
                      .fc-timegrid-slot-lane {
                        min-height: 50px;
                      }
                    }
                  `}
                </style>
                <div className="mt-4 text-sm text-center">
                  <p className="mb-1">
                    Clique em um horário disponível para agendar
                  </p>
                  <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      <span>Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
                      <span>Pendente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                      <span>Cancelado</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <button
                onClick={() => setStep(3)}
                className={`mb-4 flex items-center gap-1 ${
                  isDarkMode ? "text-slate-300" : "text-gray-600"
                } hover:underline`}
              >
                <ArrowLeft size={16} />
                Voltar para calendário
              </button>
              <h2 className="text-xl font-semibold mb-4 text-center">
                Complete seu agendamento
              </h2>
              <div className="mb-6">
                <h3 className="font-medium mb-3">Resumo da reserva:</h3>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Scissors size={16} className="text-blue-500" />
                      <span>Serviço: {formData.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <span>
                        Profissional:{" "}
                        {barbers.find((b) => b.id === formData.barberId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>
                        Data e hora:{" "}
                        {selectedDate
                          ? format(selectedDate, "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="clientName"
                    className="block mb-2 font-medium"
                  >
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-white border-gray-300"
                    } border`}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="phone" className="block mb-2 font-medium">
                    Telefone/WhatsApp
                  </label>
                  <div
                    className={`p-3 rounded-lg mb-2 ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600"
                        : "bg-blue-50 border-blue-100"
                    } border`}
                  >
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 mt-0.5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm">
                        <strong>Como inserir:</strong> Digite apenas os números,
                        incluindo o DDD. <br />
                        <span className="text-xs">
                          Exemplo:{" "}
                          <span className="font-mono bg-slate-200 dark:bg-slate-800 dark:text-white px-1 rounded">
                            6283109185
                          </span>{" "}
                          para (62) 98310-9185
                        </span>
                      </p>
                    </div>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(62) 98765-4321"
                    className={`w-full p-3 rounded-lg ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-white border-gray-300"
                    } border`}
                    pattern="[0-9]{10,11}"
                    title="Digite apenas números: DDD + número (10 ou 11 dígitos no total)"
                    required
                  />
                  <p className="text-xs mt-1 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Você receberá a confirmação no WhatsApp deste número
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-70"
                  >
                    {isLoading ? "Enviando..." : "Confirmar Agendamento"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 5 && (
            <div className="text-center py-6">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  isDarkMode ? "bg-orange-500/20" : "bg-orange-100"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Agendamento Enviado!</h2>
              <p className="mb-6">
                Seu agendamento foi enviado com sucesso e está{" "}
                <span className="text-orange-500 font-semibold">PENDENTE</span>{" "}
                de confirmação. Você receberá uma mensagem no WhatsApp para
                confirmar o agendamento.
              </p>

              <div className="mb-8">
                <h3 className="font-medium mb-3">Detalhes do agendamento:</h3>
                <div
                  className={`p-4 rounded-lg ${
                    isDarkMode ? "bg-slate-700/50" : "bg-gray-50"
                  } max-w-md mx-auto text-left`}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <span>Nome: {formData.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-500" />
                      <span>Telefone: {formData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors size={16} className="text-blue-500" />
                      <span>Serviço: {formData.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      <span>
                        Profissional:{" "}
                        {barbers.find((b) => b.id === formData.barberId)?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      <span>
                        Data e hora:{" "}
                        {selectedDate
                          ? format(selectedDate, "dd/MM/yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 mb-8 max-w-md mx-auto">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-left">
                    <strong>Importante:</strong> Para confirmar seu agendamento,
                    responda &quot;CONFIRMAR&quot; à mensagem que enviaremos
                    pelo WhatsApp. Caso precise cancelar, responda
                    &quot;CANCELAR&quot;.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Fazer Novo Agendamento
                </button>
                <Link
                  to="/"
                  className={`px-6 py-3 rounded-lg font-medium ${
                    isDarkMode
                      ? "bg-slate-700 hover:bg-slate-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  } transition-all`}
                >
                  Voltar para a Página Inicial
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {dateModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md rounded-xl ${
              isDarkMode ? "bg-slate-800" : "bg-white"
            } p-5 shadow-2xl`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Selecione Data e Hora</h3>
              <button
                onClick={() => setDateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Data</label>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateModalSelect(date)}
                    className={`px-2 py-3 rounded-lg text-center text-sm transition ${
                      selectedModalDate &&
                      selectedModalDate.getDate() === date.getDate() &&
                      selectedModalDate.getMonth() === date.getMonth()
                        ? "bg-blue-500 text-white"
                        : isDarkMode
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="font-semibold mb-1">
                      {format(date, "EEE", { locale: ptBR })}
                    </div>
                    <div className="text-sm">{format(date, "dd/MM")}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Horário</label>
              <div className="h-48 overflow-y-auto grid grid-cols-3 gap-2">
                {availableHours.length > 0 ? (
                  availableHours.map((hour, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedModalHour(hour)}
                      className={`p-2 rounded-lg flex items-center justify-center gap-1 transition ${
                        selectedModalHour === hour
                          ? "bg-blue-500 text-white"
                          : isDarkMode
                          ? "bg-slate-700 hover:bg-slate-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      <Clock size={14} />
                      <span>{hour}</span>
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    Não há horários disponíveis para esta data
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleConfirmDateTime}
                disabled={!selectedModalDate || !selectedModalHour}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Horário
              </button>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`mt-12 py-6 ${
          isDarkMode ? "bg-slate-800/50" : "bg-gray-100"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Barbearia Style | Todos os
              direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientScheduling;
