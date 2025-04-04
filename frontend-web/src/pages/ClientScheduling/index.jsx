import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { format, parseISO, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Scissors, ArrowLeft, Calendar, User, Phone } from "lucide-react";
import { publicApi } from "../../services/api";
import { useTheme } from "../../contexts/ThemeContext";

const services = [
  { id: 1, name: "Corte de Cabelo", price: 35 },
  { id: 2, name: "Barba", price: 25 },
  { id: 3, name: "Corte e Barba", price: 55 },
  { id: 4, name: "Tratamento Capilar", price: 45 },
];

const ClientScheduling = () => {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [step, setStep] = useState(1); // 1: Service, 2: Barber, 3: Date, 4: Form, 5: Confirmation
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const formattedEvents = response.data.map((s) => ({
        id: s.id,
        title: s.status === "CONFIRMED" ? "Confirmado" : "Cancelado",
        start: parseISO(s.dateTime),
        end: addHours(parseISO(s.dateTime), 1),
        backgroundColor: s.status === "CONFIRMED" ? "#FFA500" : "#ff4646",
        borderColor: s.status === "CONFIRMED" ? "#FF8C00" : "#ff3333",
        display: "block",
      }));
      setEvents(formattedEvents);
    } catch {
      setError("Não foi possível carregar os horários.");
    }
  };

  useEffect(() => {
    fetchBarbers();
    fetchEvents();
  }, []);

  const handleDateSelect = (selectInfo) => {
    // Verificar se a data não é no passado
    const now = new Date();
    if (selectInfo.start < now) {
      setError("Não é possível agendar em datas passadas.");
      return;
    }

    // Verificar se o horário está dentro do expediente (8h às 18h)
    const hour = selectInfo.start.getHours();
    if (hour < 8 || hour >= 18) {
      setError("Horários disponíveis apenas das 8h às 18h.");
      return;
    }

    // Verificar se não é domingo (0 = domingo)
    if (selectInfo.start.getDay() === 0) {
      setError("Não realizamos agendamentos aos domingos.");
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

    try {
      // Validar formulário
      if (!formData.clientName || !formData.phone || !formData.dateTime) {
        setError("Preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
      }

      // Enviar agendamento
      await publicApi.post("/public/scheduling/appointments", formData);
      setSuccess("Agendamento realizado com sucesso!");
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao realizar agendamento.");
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
      {/* Header */}
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

      {/* Main Content */}
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
          {/* Step 1: Select Service */}
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

          {/* Step 2: Select Barber */}
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

          {/* Step 3: Select Date/Time */}
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
                  slotMaxTime="18:00:00"
                  allDaySlot={false}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  locale={ptBrLocale}
                  select={handleDateSelect}
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
                <div className="mt-4 text-sm text-center">
                  <p className="mb-1">
                    Clique em um horário disponível para agendar
                  </p>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                      <span>Horário cancelado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                      <span>Horário confirmado</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Client Information */}
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
                          <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">
                            62983109185
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

          {/* Step 5: Confirmation */}
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

      {/* Footer */}
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
