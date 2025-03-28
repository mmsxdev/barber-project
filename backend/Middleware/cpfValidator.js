import { cpf } from "cpf-cnpj-validator";

export const validateCPF = (req, res, next) => {
  const { cpf: cpfValue } = req.body;

  // Se não houver CPF no body, verifica se está nos parâmetros (para rotas DELETE/PATCH)
  const cpfToValidate = cpfValue || req.params.cpf;

  if (!cpfToValidate) {
    return res.status(400).json({ message: "CPF é obrigatório!" });
  }

  // Remove caracteres não numéricos
  const cleanCPF = cpfToValidate.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return res.status(400).json({ message: "CPF deve conter 11 dígitos!" });
  }

  // Valida o CPF usando a biblioteca
  if (!cpf.isValid(cleanCPF)) {
    return res.status(400).json({ message: "CPF inválido!" });
  }

  // Se chegou aqui, o CPF é válido
  // Atualiza o CPF no body/params com o valor limpo
  if (cpfValue) {
    req.body.cpf = cleanCPF;
  } else {
    req.params.cpf = cleanCPF;
  }

  next();
};
