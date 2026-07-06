import { StatusEmpresa, StatusObrigacao, StatusEvento } from "@prisma/client";
import { STATUS_EMPRESA_LABEL, STATUS_OBRIGACAO_LABEL, STATUS_EVENTO_LABEL } from "@/types";
import { cn } from "@/lib/utils";

const EMPRESA_COR: Record<StatusEmpresa, string> = {
  CADASTRO_INCOMPLETO: "badge-pink",
  IMPLANTACAO:         "badge-blue",
  ATIVA:               "badge-green",
  EM_ATENCAO:          "badge-yellow",
  INATIVA:             "badge-gray",
  ENCERRADA:           "badge-red",
  EX_CLIENTE:          "badge-gray",
};

const OBRIGACAO_COR: Record<StatusObrigacao, string> = {
  NAO_INICIADO:          "badge-gray",
  EM_ANDAMENTO:          "badge-blue",
  AGUARDANDO_CLIENTE:    "badge-yellow",
  RECEBIDO_PARCIALMENTE: "badge-yellow",
  RECEBIDO:              "badge-blue",
  ENVIADO:               "badge-blue",
  CONCLUIDO:             "badge-green",
  NAO_SE_APLICA:         "badge-gray",
  EM_ATRASO:             "badge-red",
};

const EVENTO_COR: Record<StatusEvento, string> = {
  NAO_INICIADO:      "badge-gray",
  EM_ANDAMENTO:      "badge-blue",
  AGUARDANDO_CLIENTE:"badge-yellow",
  AGUARDANDO_ORGAO:  "badge-yellow",
  AGUARDANDO_SETOR:  "badge-yellow",
  CONCLUIDO:         "badge-green",
  CANCELADO:         "badge-gray",
};

export function BadgeEmpresa({ status }: { status: StatusEmpresa }) {
  return <span className={cn("badge", EMPRESA_COR[status])}>{STATUS_EMPRESA_LABEL[status]}</span>;
}

export function BadgeObrigacao({ status }: { status: StatusObrigacao }) {
  return <span className={cn("badge", OBRIGACAO_COR[status])}>{STATUS_OBRIGACAO_LABEL[status]}</span>;
}

export function BadgeEvento({ status }: { status: StatusEvento }) {
  return <span className={cn("badge", EVENTO_COR[status])}>{STATUS_EVENTO_LABEL[status]}</span>;
}
