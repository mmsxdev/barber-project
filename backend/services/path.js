import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para determinar o diretório de uploads
const getUploadsDir = () => {
  if (process.env.NODE_ENV === "production") {
    return "/tmp/uploads";
  }
  return path.join(__dirname, "../uploads");
};

// Criar diretório se não existir
const createUploadsDir = () => {
  const dir = getUploadsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
createUploadsDir();

// Função para sanitizar o nome do arquivo
export const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, "_");
};

// Função para validar o caminho do arquivo
export const validateFilePath = (fileName) => {
  const uploadsDir = getUploadsDir();
  const safeFileName = sanitizeFileName(fileName);
  const filePath = path.join(uploadsDir, safeFileName);

  // Verificação de segurança
  if (!filePath.startsWith(uploadsDir)) {
    throw new Error("Tentativa de acesso a caminho não autorizado");
  }

  return filePath;
};
