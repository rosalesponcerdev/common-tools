import {
  FactoringOpportunity,
  FactoringResult,
  PlazoFijoResult,
  ComparisonResult,
} from './factoring-opportunity.entity';

const DIAS_MES = 30;
const DIAS_ANO = 360;
const TASA_COMISION = 0.1;
const TASA_IGV = 0.18;
const TASA_IMPUESTO_RENTA = 0.05;

export function calculateDiasRestantes(paymentDate: string): number {
  const fechaPago = new Date(paymentDate);
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0);
  fechaPago.setHours(0, 0, 0, 0);
  const diffTime = fechaPago.getTime() - fechaActual.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateMontoMaximo(opportunity: FactoringOpportunity): number {
  return opportunity.target_amount * (1 - opportunity.percentage_financed / 100);
}

export function calculateFactoring(
  opportunity: FactoringOpportunity,
  montoInversion: number,
): FactoringResult {
  const dias = calculateDiasRestantes(opportunity.payment_date);

  if (dias <= 0 || montoInversion <= 0) {
    return createEmptyFactoringResult(opportunity, montoInversion);
  }

  const factor = Math.pow(1 + opportunity.financing_interest_rate, dias / DIAS_MES);

  const gananciaBruta = montoInversion * (factor - 1);

  console.log({
    a: Math.round(gananciaBruta * 100) / 100,
    dias,
  });

  const comision = gananciaBruta * TASA_COMISION;
  const igv = comision * TASA_IGV;
  const pre = gananciaBruta - comision - igv;
  const impuestoRenta = pre * TASA_IMPUESTO_RENTA;

  const gananciaNeta = pre - impuestoRenta;

  const teaNetaReal = Math.pow(1 + gananciaNeta / montoInversion, DIAS_ANO / dias) - 1;

  return Object.freeze({
    opportunity,
    diasRestantes: dias,
    montoInvertido: montoInversion,
    gananciaBruta: Math.round(gananciaBruta * 100) / 100,
    comision: Math.round(comision * 100) / 100,
    igv: Math.round(igv * 100) / 100,
    impuestoRenta: Math.round(impuestoRenta * 100) / 100,
    gananciaNeta: Math.round(gananciaNeta * 100) / 100,
    teaNetaReal: Math.round(teaNetaReal * 100000) / 100000,
    esMasRentable: false,
  });
}

export function calculatePlazoFijo(
  monto: number,
  teaPlazoFijo: number,
  dias: number,
): PlazoFijoResult {
  if (dias <= 0 || monto <= 0 || teaPlazoFijo <= 0) {
    return createEmptyPlazoFijoResult(monto, teaPlazoFijo);
  }

  const factor = Math.pow(1 + teaPlazoFijo, dias / DIAS_ANO);
  const gananciaBruta = monto * (factor - 1);

  return Object.freeze({
    montoInvertido: monto,
    gananciaBruta: Math.round(gananciaBruta * 100) / 100,
    gananciaNeta: Math.round(gananciaBruta * 100) / 100,
    tea: teaPlazoFijo,
    esMasRentable: false,
  });
}

export function compareResults(
  factoring: FactoringResult,
  plazoFijo: PlazoFijoResult,
): ComparisonResult {
  const winner: 'factoring' | 'plazofijo' =
    factoring.gananciaNeta > plazoFijo.gananciaNeta ? 'factoring' : 'plazofijo';

  return Object.freeze({
    factoring: {
      ...factoring,
      esMasRentable: winner === 'factoring',
    },
    plazoFijo: {
      ...plazoFijo,
      esMasRentable: winner === 'plazofijo',
    },
    winner,
  });
}

function createEmptyFactoringResult(
  opportunity: FactoringOpportunity,
  montoInversion: number,
): FactoringResult {
  return Object.freeze({
    opportunity,
    diasRestantes: 0,
    montoInvertido: montoInversion,
    gananciaBruta: 0,
    comision: 0,
    igv: 0,
    impuestoRenta: 0,
    gananciaNeta: 0,
    teaNetaReal: 0,
    esMasRentable: false,
  });
}

function createEmptyPlazoFijoResult(monto: number, tea: number): PlazoFijoResult {
  return Object.freeze({
    montoInvertido: monto,
    gananciaBruta: 0,
    gananciaNeta: 0,
    tea,
    esMasRentable: false,
  });
}

export function getTotalDisponible(opportunities: FactoringOpportunity[]): number {
  return opportunities.reduce((total, opp) => total + calculateMontoMaximo(opp), 0);
}

export function distributeMonto(
  opportunities: FactoringOpportunity[],
  montoTotal: number,
): Map<string, number> {
  const distribution = new Map<string, number>();
  let remaining = montoTotal;

  const sorted = [...opportunities].sort((a, b) => {
    const maxA = calculateMontoMaximo(a);
    const maxB = calculateMontoMaximo(b);
    return maxB - maxA;
  });

  for (const opp of sorted) {
    const max = calculateMontoMaximo(opp);
    const assigned = Math.min(remaining, max);
    distribution.set(opp._id, assigned);
    remaining -= assigned;
    if (remaining <= 0) break;
  }

  for (const opp of opportunities) {
    if (!distribution.has(opp._id)) {
      distribution.set(opp._id, 0);
    }
  }

  return distribution;
}
