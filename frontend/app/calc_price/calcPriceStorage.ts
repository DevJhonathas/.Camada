export type FormValues = {
  horasImpressaoHoras: string;
  horasImpressaoMinutos: string;
  pesoPeca: string;
  valorFilamento: string;
  pesoRolo: string;
  desperdicioFilamento: string;
  potenciaKW: string;
  tarifaKW: string;
  valorImpressora: string;
  vidaUtil: string;
  horasUsoMensal: string;
  custoManutencaoMensal: string;
  custoPrimer: string;
  custoVerniz: string;
  custoLixas: string;
  custoTintaAcrilica: string;
  tempoModelagem: string;
  tempoAcabamento: string;
  valorHora: string;
  taxaPlataforma: string;
  impostos: string;
  custoEmbalagem: string;
  outrosCustos: string;
  margemLucro: string;
};

export type PriceHistoryEntry = {
  id: string;
  name: string;
  savedAt: string;
  values: FormValues;
  isActionFigure: boolean;
  calculation: {
    suggestedPrice: number;
    totalCost: number;
    profit: number;
    actualMargin: number;
  };
};

export type PresetLoadDetail = {
  name: string;
  values: FormValues;
  isActionFigure: boolean;
};

export const DRAFT_STORAGE_KEY = "camada:calc-price:v1";
export const HISTORY_STORAGE_KEY = "camada:calc-price:history:v1";
export const HISTORY_UPDATED_EVENT = "camada:calc-price:history-updated";
export const PRESET_LOAD_EVENT = "camada:calc-price:load-preset";
