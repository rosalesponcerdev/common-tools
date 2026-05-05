import { Tool } from '../domain';

export const TOOLS_DATA: Tool[] = [
  {
    id: 'prestamype-factoring',
    name: 'Calculadora de Factoring',
    description: 'Simula descuentos de facturas en factoring',
    icon: '📄',
    category: 'prestamype',
    route: '/tools/prestamype/factoring',
  },
  // {
  //   id: 'prestamype-simulador-tea',
  //   name: 'Simulador TEA',
  //   description: 'Calcula tasa efectiva anual',
  //   icon: '📈',
  //   category: 'prestamype',
  //   route: '/tools/prestamype/simulador-tea',
  // },
  // {
  //   id: 'prestamype-flujo-caja',
  //   name: 'Calculadora de Flujo de Caja',
  //   description: 'Proyecta flujos de efectivo',
  //   icon: '💵',
  //   category: 'prestamype',
  //   route: '/tools/prestamype/flujo-caja',
  // },
  // {
  //   id: 'prestamype-descuento',
  //   name: 'Calculadora de Descuento',
  //   description: 'Calcula descuentos comerciales',
  //   icon: '🏷️',
  //   category: 'prestamype',
  //   route: '/tools/prestamype/descuento',
  // },
];
