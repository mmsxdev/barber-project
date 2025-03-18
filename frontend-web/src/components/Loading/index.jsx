export default function Loading({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4 animate-fade-in">
      <div className="relative">
        {/* Spinner principal */}
        <div className="w-12 h-12 rounded-full absolute border-4 border-slate-700"></div>
        <div className="w-12 h-12 rounded-full animate-spin-slow border-4 border-transparent border-t-blue-400 border-r-purple-300"></div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-medium bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text text-transparent">
          {message}
        </span>
      </div>
    </div>
  );
}
