import { BusinessContext } from '../types';

export interface PreloadedDataset {
  id: string;
  name: string;
  category: string;
  description: string;
  context: BusinessContext;
  headers: string[];
  data: Record<string, string | number>[];
  suggestedDepVar: string;
  suggestedIndepVars: string[];
  priceVar: string;
}

// 1. Retail Bebidas FMCG
const retailData: Record<string, string | number>[] = [
  { Semana: 1, Precio_Unitario: 3.20, Demanda_Unidades: 14200, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4500, Descuento_Promocional_Pct: 5, Temperatura_Media_C: 22.4, Canal_Supermercado: 1 },
  { Semana: 2, Precio_Unitario: 3.20, Demanda_Unidades: 13950, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 4200, Descuento_Promocional_Pct: 5, Temperatura_Media_C: 21.8, Canal_Supermercado: 1 },
  { Semana: 3, Precio_Unitario: 3.50, Demanda_Unidades: 12100, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 3800, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 19.5, Canal_Supermercado: 1 },
  { Semana: 4, Precio_Unitario: 3.50, Demanda_Unidades: 11800, Precio_Competidor: 3.40, Gasto_Publicidad_USD: 3500, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 18.2, Canal_Supermercado: 1 },
  { Semana: 5, Precio_Unitario: 2.90, Demanda_Unidades: 16800, Precio_Competidor: 3.40, Gasto_Publicidad_USD: 6000, Descuento_Promocional_Pct: 15, Temperatura_Media_C: 23.1, Canal_Supermercado: 1 },
  { Semana: 6, Precio_Unitario: 2.90, Demanda_Unidades: 17200, Precio_Competidor: 3.25, Gasto_Publicidad_USD: 6500, Descuento_Promocional_Pct: 15, Temperatura_Media_C: 24.5, Canal_Supermercado: 1 },
  { Semana: 7, Precio_Unitario: 3.10, Demanda_Unidades: 14900, Precio_Competidor: 3.25, Gasto_Publicidad_USD: 5100, Descuento_Promocional_Pct: 8, Temperatura_Media_C: 25.0, Canal_Supermercado: 1 },
  { Semana: 8, Precio_Unitario: 3.30, Demanda_Unidades: 13400, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 4400, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 23.8, Canal_Supermercado: 1 },
  { Semana: 9, Precio_Unitario: 3.40, Demanda_Unidades: 12800, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4000, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 22.0, Canal_Supermercado: 1 },
  { Semana: 10, Precio_Unitario: 3.60, Demanda_Unidades: 11200, Precio_Competidor: 3.40, Gasto_Publicidad_USD: 3200, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 20.1, Canal_Supermercado: 1 },
  { Semana: 11, Precio_Unitario: 3.00, Demanda_Unidades: 15800, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 5800, Descuento_Promocional_Pct: 10, Temperatura_Media_C: 26.2, Canal_Supermercado: 1 },
  { Semana: 12, Precio_Unitario: 2.80, Demanda_Unidades: 18400, Precio_Competidor: 3.20, Gasto_Publicidad_USD: 7200, Descuento_Promocional_Pct: 20, Temperatura_Media_C: 28.0, Canal_Supermercado: 1 },
  { Semana: 13, Precio_Unitario: 3.10, Demanda_Unidades: 14600, Precio_Competidor: 3.25, Gasto_Publicidad_USD: 4800, Descuento_Promocional_Pct: 5, Temperatura_Media_C: 27.5, Canal_Supermercado: 1 },
  { Semana: 14, Precio_Unitario: 3.30, Demanda_Unidades: 13100, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4100, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 26.0, Canal_Supermercado: 1 },
  { Semana: 15, Precio_Unitario: 3.50, Demanda_Unidades: 11900, Precio_Competidor: 3.45, Gasto_Publicidad_USD: 3600, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 24.3, Canal_Supermercado: 1 },
  { Semana: 16, Precio_Unitario: 3.70, Demanda_Unidades: 10400, Precio_Competidor: 3.50, Gasto_Publicidad_USD: 3000, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 21.0, Canal_Supermercado: 1 },
  { Semana: 17, Precio_Unitario: 2.95, Demanda_Unidades: 16400, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 6200, Descuento_Promocional_Pct: 12, Temperatura_Media_C: 28.8, Canal_Supermercado: 1 },
  { Semana: 18, Precio_Unitario: 2.85, Demanda_Unidades: 17900, Precio_Competidor: 3.20, Gasto_Publicidad_USD: 7000, Descuento_Promocional_Pct: 18, Temperatura_Media_C: 30.2, Canal_Supermercado: 1 },
  { Semana: 19, Precio_Unitario: 3.05, Demanda_Unidades: 15100, Precio_Competidor: 3.25, Gasto_Publicidad_USD: 5300, Descuento_Promocional_Pct: 6, Temperatura_Media_C: 29.5, Canal_Supermercado: 1 },
  { Semana: 20, Precio_Unitario: 3.25, Demanda_Unidades: 13700, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4600, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 28.1, Canal_Supermercado: 1 },
  { Semana: 21, Precio_Unitario: 3.45, Demanda_Unidades: 12300, Precio_Competidor: 3.40, Gasto_Publicidad_USD: 3900, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 25.4, Canal_Supermercado: 1 },
  { Semana: 22, Precio_Unitario: 3.65, Demanda_Unidades: 10800, Precio_Competidor: 3.45, Gasto_Publicidad_USD: 3100, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 22.9, Canal_Supermercado: 1 },
  { Semana: 23, Precio_Unitario: 3.15, Demanda_Unidades: 14400, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 4900, Descuento_Promocional_Pct: 4, Temperatura_Media_C: 24.6, Canal_Supermercado: 1 },
  { Semana: 24, Precio_Unitario: 2.90, Demanda_Unidades: 16900, Precio_Competidor: 3.25, Gasto_Publicidad_USD: 6600, Descuento_Promocional_Pct: 15, Temperatura_Media_C: 27.8, Canal_Supermercado: 1 },
  { Semana: 25, Precio_Unitario: 3.35, Demanda_Unidades: 13000, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4300, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 26.5, Canal_Supermercado: 1 },
  { Semana: 26, Precio_Unitario: 3.55, Demanda_Unidades: 11500, Precio_Competidor: 3.45, Gasto_Publicidad_USD: 3400, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 23.2, Canal_Supermercado: 1 },
  { Semana: 27, Precio_Unitario: 2.99, Demanda_Unidades: 16000, Precio_Competidor: 3.30, Gasto_Publicidad_USD: 5900, Descuento_Promocional_Pct: 10, Temperatura_Media_C: 25.1, Canal_Supermercado: 1 },
  { Semana: 28, Precio_Unitario: 3.20, Demanda_Unidades: 14100, Precio_Competidor: 3.35, Gasto_Publicidad_USD: 4700, Descuento_Promocional_Pct: 5, Temperatura_Media_C: 24.0, Canal_Supermercado: 1 },
  { Semana: 29, Precio_Unitario: 3.40, Demanda_Unidades: 12700, Precio_Competidor: 3.40, Gasto_Publicidad_USD: 4100, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 22.8, Canal_Supermercado: 1 },
  { Semana: 30, Precio_Unitario: 3.60, Demanda_Unidades: 11100, Precio_Competidor: 3.50, Gasto_Publicidad_USD: 3300, Descuento_Promocional_Pct: 0, Temperatura_Media_C: 20.5, Canal_Supermercado: 1 }
];

// 2. SaaS B2B Suscripciones
const saasData: Record<string, string | number>[] = [
  { Mes: 1, Precio_Plan_USD: 79, Nuevas_Suscripciones: 410, Gasto_Marketing_USD: 14000, Features_Pro: 6, SLA_Horas: 12, Churn_Rate_Pct: 3.2 },
  { Mes: 2, Precio_Plan_USD: 79, Nuevas_Suscripciones: 425, Gasto_Marketing_USD: 14800, Features_Pro: 6, SLA_Horas: 12, Churn_Rate_Pct: 3.1 },
  { Mes: 3, Precio_Plan_USD: 89, Nuevas_Suscripciones: 375, Gasto_Marketing_USD: 15200, Features_Pro: 7, SLA_Horas: 10, Churn_Rate_Pct: 2.9 },
  { Mes: 4, Precio_Plan_USD: 89, Nuevas_Suscripciones: 388, Gasto_Marketing_USD: 15500, Features_Pro: 7, SLA_Horas: 10, Churn_Rate_Pct: 2.8 },
  { Mes: 5, Precio_Plan_USD: 99, Nuevas_Suscripciones: 340, Gasto_Marketing_USD: 16000, Features_Pro: 8, SLA_Horas: 8, Churn_Rate_Pct: 2.6 },
  { Mes: 6, Precio_Plan_USD: 99, Nuevas_Suscripciones: 355, Gasto_Marketing_USD: 16800, Features_Pro: 8, SLA_Horas: 8, Churn_Rate_Pct: 2.5 },
  { Mes: 7, Precio_Plan_USD: 69, Nuevas_Suscripciones: 490, Gasto_Marketing_USD: 18000, Features_Pro: 8, SLA_Horas: 8, Churn_Rate_Pct: 2.7 },
  { Mes: 8, Precio_Plan_USD: 69, Nuevas_Suscripciones: 510, Gasto_Marketing_USD: 18500, Features_Pro: 8, SLA_Horas: 8, Churn_Rate_Pct: 2.8 },
  { Mes: 9, Precio_Plan_USD: 109, Nuevas_Suscripciones: 310, Gasto_Marketing_USD: 17200, Features_Pro: 9, SLA_Horas: 6, Churn_Rate_Pct: 2.3 },
  { Mes: 10, Precio_Plan_USD: 109, Nuevas_Suscripciones: 325, Gasto_Marketing_USD: 17600, Features_Pro: 9, SLA_Horas: 6, Churn_Rate_Pct: 2.2 },
  { Mes: 11, Precio_Plan_USD: 119, Nuevas_Suscripciones: 280, Gasto_Marketing_USD: 18200, Features_Pro: 10, SLA_Horas: 4, Churn_Rate_Pct: 2.0 },
  { Mes: 12, Precio_Plan_USD: 119, Nuevas_Suscripciones: 295, Gasto_Marketing_USD: 19000, Features_Pro: 10, SLA_Horas: 4, Churn_Rate_Pct: 1.9 },
  { Mes: 13, Precio_Plan_USD: 85, Nuevas_Suscripciones: 430, Gasto_Marketing_USD: 16500, Features_Pro: 10, SLA_Horas: 4, Churn_Rate_Pct: 2.1 },
  { Mes: 14, Precio_Plan_USD: 85, Nuevas_Suscripciones: 445, Gasto_Marketing_USD: 17000, Features_Pro: 10, SLA_Horas: 4, Churn_Rate_Pct: 2.0 },
  { Mes: 15, Precio_Plan_USD: 95, Nuevas_Suscripciones: 390, Gasto_Marketing_USD: 17800, Features_Pro: 11, SLA_Horas: 4, Churn_Rate_Pct: 1.8 },
  { Mes: 16, Precio_Plan_USD: 95, Nuevas_Suscripciones: 405, Gasto_Marketing_USD: 18400, Features_Pro: 11, SLA_Horas: 4, Churn_Rate_Pct: 1.7 },
  { Mes: 17, Precio_Plan_USD: 129, Nuevas_Suscripciones: 260, Gasto_Marketing_USD: 19500, Features_Pro: 12, SLA_Horas: 2, Churn_Rate_Pct: 1.6 },
  { Mes: 18, Precio_Plan_USD: 129, Nuevas_Suscripciones: 275, Gasto_Marketing_USD: 20000, Features_Pro: 12, SLA_Horas: 2, Churn_Rate_Pct: 1.5 },
  { Mes: 19, Precio_Plan_USD: 75, Nuevas_Suscripciones: 480, Gasto_Marketing_USD: 17500, Features_Pro: 12, SLA_Horas: 2, Churn_Rate_Pct: 1.7 },
  { Mes: 20, Precio_Plan_USD: 75, Nuevas_Suscripciones: 495, Gasto_Marketing_USD: 18000, Features_Pro: 12, SLA_Horas: 2, Churn_Rate_Pct: 1.6 },
  { Mes: 21, Precio_Plan_USD: 105, Nuevas_Suscripciones: 360, Gasto_Marketing_USD: 18800, Features_Pro: 13, SLA_Horas: 2, Churn_Rate_Pct: 1.4 },
  { Mes: 22, Precio_Plan_USD: 105, Nuevas_Suscripciones: 372, Gasto_Marketing_USD: 19200, Features_Pro: 13, SLA_Horas: 2, Churn_Rate_Pct: 1.4 },
  { Mes: 23, Precio_Plan_USD: 115, Nuevas_Suscripciones: 320, Gasto_Marketing_USD: 19800, Features_Pro: 14, SLA_Horas: 1, Churn_Rate_Pct: 1.3 },
  { Mes: 24, Precio_Plan_USD: 115, Nuevas_Suscripciones: 335, Gasto_Marketing_USD: 20500, Features_Pro: 14, SLA_Horas: 1, Churn_Rate_Pct: 1.2 }
];

// 3. E-Commerce Auriculares Premium
const ecommerceData: Record<string, string | number>[] = [
  { Dia: 1, Precio_Venta_USD: 179, Unidades_Vendidas: 84, Visitas_Web: 4800, Rating_Reviews: 4.6, Envio_Gratis: 1, Precio_Competidor_Rival: 185 },
  { Dia: 2, Precio_Venta_USD: 179, Unidades_Vendidas: 88, Visitas_Web: 5050, Rating_Reviews: 4.6, Envio_Gratis: 1, Precio_Competidor_Rival: 185 },
  { Dia: 3, Precio_Venta_USD: 189, Unidades_Vendidas: 75, Visitas_Web: 4700, Rating_Reviews: 4.6, Envio_Gratis: 1, Precio_Competidor_Rival: 189 },
  { Dia: 4, Precio_Venta_USD: 189, Unidades_Vendidas: 78, Visitas_Web: 4900, Rating_Reviews: 4.6, Envio_Gratis: 1, Precio_Competidor_Rival: 189 },
  { Dia: 5, Precio_Venta_USD: 199, Unidades_Vendidas: 66, Visitas_Web: 4600, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 195 },
  { Dia: 6, Precio_Venta_USD: 199, Unidades_Vendidas: 69, Visitas_Web: 4800, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 195 },
  { Dia: 7, Precio_Venta_USD: 159, Unidades_Vendidas: 112, Visitas_Web: 5600, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 179 },
  { Dia: 8, Precio_Venta_USD: 159, Unidades_Vendidas: 118, Visitas_Web: 5850, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 179 },
  { Dia: 9, Precio_Venta_USD: 169, Unidades_Vendidas: 96, Visitas_Web: 5200, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 180 },
  { Dia: 10, Precio_Venta_USD: 169, Unidades_Vendidas: 101, Visitas_Web: 5350, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 180 },
  { Dia: 11, Precio_Venta_USD: 209, Unidades_Vendidas: 58, Visitas_Web: 4400, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 200 },
  { Dia: 12, Precio_Venta_USD: 209, Unidades_Vendidas: 61, Visitas_Web: 4550, Rating_Reviews: 4.7, Envio_Gratis: 1, Precio_Competidor_Rival: 200 },
  { Dia: 13, Precio_Venta_USD: 219, Unidades_Vendidas: 50, Visitas_Web: 4200, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 210 },
  { Dia: 14, Precio_Venta_USD: 219, Unidades_Vendidas: 53, Visitas_Web: 4350, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 210 },
  { Dia: 15, Precio_Venta_USD: 149, Unidades_Vendidas: 128, Visitas_Web: 6100, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 175 },
  { Dia: 16, Precio_Venta_USD: 149, Unidades_Vendidas: 135, Visitas_Web: 6300, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 175 },
  { Dia: 17, Precio_Venta_USD: 175, Unidades_Vendidas: 89, Visitas_Web: 5100, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 182 },
  { Dia: 18, Precio_Venta_USD: 185, Unidades_Vendidas: 80, Visitas_Web: 4850, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 188 },
  { Dia: 19, Precio_Venta_USD: 195, Unidades_Vendidas: 72, Visitas_Web: 4650, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 192 },
  { Dia: 20, Precio_Venta_USD: 225, Unidades_Vendidas: 46, Visitas_Web: 4100, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 215 },
  { Dia: 21, Precio_Venta_USD: 165, Unidades_Vendidas: 104, Visitas_Web: 5400, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 178 },
  { Dia: 22, Precio_Venta_USD: 175, Unidades_Vendidas: 91, Visitas_Web: 5050, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 184 },
  { Dia: 23, Precio_Venta_USD: 185, Unidades_Vendidas: 82, Visitas_Web: 4900, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 189 },
  { Dia: 24, Precio_Venta_USD: 205, Unidades_Vendidas: 62, Visitas_Web: 4500, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 202 },
  { Dia: 25, Precio_Venta_USD: 215, Unidades_Vendidas: 54, Visitas_Web: 4300, Rating_Reviews: 4.8, Envio_Gratis: 1, Precio_Competidor_Rival: 208 }
];

export const PRELOADED_DATASETS: PreloadedDataset[] = [
  {
    id: 'fmcg_beverages',
    name: 'Retail FMCG: Bebidas & Refrescos',
    category: 'Consumo Masivo / Retail',
    description: '30 semanas de ventas, precios, inversión publicitaria, competencia y factores estacionales para bebida isotónica 500ml.',
    context: {
      sector: 'Alimentos y Bebidas (FMCG)',
      product: 'Bebida Isotónica Hidratante 500ml',
      businessGoal: 'maximize_profit',
      strategicQuestion: '¿Cuál es el precio óptimo que maximiza el beneficio neto considerando la canibalización y reacción de marcas rivales?',
      minPrice: 2.20,
      maxPrice: 4.20,
      unitCost: 1.45,
      fixedCost: 4500,
      currentPrice: 3.20
    },
    headers: Object.keys(retailData[0]),
    data: retailData,
    suggestedDepVar: 'Demanda_Unidades',
    suggestedIndepVars: ['Precio_Unitario', 'Precio_Competidor', 'Gasto_Publicidad_USD', 'Descuento_Promocional_Pct', 'Temperatura_Media_C'],
    priceVar: 'Precio_Unitario'
  },
  {
    id: 'saas_cloud',
    name: 'SaaS B2B: Suscripciones Cloud Platform',
    category: 'Software & Tecnología B2B',
    description: '24 meses de precio de suscripción, nuevas adquisiciones de clientes, inversión en Google Ads, SLA y retención.',
    context: {
      sector: 'Cloud Software & B2B SaaS',
      product: 'Data Analytics Workspace Pro',
      businessGoal: 'maximize_revenue',
      strategicQuestion: '¿Cómo modular el precio mensual de suscripción para acelerar el ARR sin frenar el flujo de nuevos clientes?',
      minPrice: 59,
      maxPrice: 159,
      unitCost: 15.00,
      fixedCost: 8500,
      currentPrice: 99.00
    },
    headers: Object.keys(saasData[0]),
    data: saasData,
    suggestedDepVar: 'Nuevas_Suscripciones',
    suggestedIndepVars: ['Precio_Plan_USD', 'Gasto_Marketing_USD', 'Features_Pro', 'SLA_Horas'],
    priceVar: 'Precio_Plan_USD'
  },
  {
    id: 'ecommerce_electronics',
    name: 'E-Commerce: Auriculares Premium ANC',
    category: 'Comercio Electrónico / Gadgets',
    description: '25 días de transacciones diarias, tráfico web, calificaciones de usuarios, precio de referencia de Amazon y promociones.',
    context: {
      sector: 'Electrónica de Consumo Direct-to-Consumer',
      product: 'Auriculares Inalámbricos Noise Cancelling Studio',
      businessGoal: 'maximize_profit',
      strategicQuestion: '¿Hasta qué nivel podemos incrementar el precio en canal digital sin provocar fuga de compradores a la competencia?',
      minPrice: 130,
      maxPrice: 240,
      unitCost: 68.00,
      fixedCost: 3200,
      currentPrice: 189.00
    },
    headers: Object.keys(ecommerceData[0]),
    data: ecommerceData,
    suggestedDepVar: 'Unidades_Vendidas',
    suggestedIndepVars: ['Precio_Venta_USD', 'Visitas_Web', 'Rating_Reviews', 'Precio_Competidor_Rival'],
    priceVar: 'Precio_Venta_USD'
  }
];
