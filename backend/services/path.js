import { fileURLToPath } from "url";
import path from "path";

// Recriar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para sanitizar o nome do arquivo
export const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, "_"); // Permite apenas letras, números, hífens, underscores e pontos
};

// Função para validar o caminho do arquivo
export const validateFilePath = (fileName) => {
  const uploadsDir = path.join(__dirname, "../uploads");
  const safeFileName = sanitizeFileName(fileName);
  const filePath = path.join(uploadsDir, safeFileName);

  // Verifica se o caminho gerado está dentro do diretório permitido
  if (!filePath.startsWith(uploadsDir)) {
    throw new Error(
      "Tentativa de acesso não autorizado ao caminho do arquivo."
    );
  }

  return filePath;
};
