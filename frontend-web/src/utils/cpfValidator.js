// Função para validar CPF
export const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return {
      isValid: false,
      message: "CPF deve conter 11 dígitos",
    };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) {
    return {
      isValid: false,
      message: "CPF inválido",
    };
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) {
    return {
      isValid: false,
      message: "CPF inválido",
    };
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit > 9) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) {
    return {
      isValid: false,
      message: "CPF inválido",
    };
  }

  return {
    isValid: true,
    message: "CPF válido",
  };
};

// Função para formatar CPF
export const formatCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, "");
  return cleanCPF
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{2})$/, "$1-$2");
};
