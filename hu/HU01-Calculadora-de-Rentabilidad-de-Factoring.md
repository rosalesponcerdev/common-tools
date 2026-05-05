Implementa una nueva funcionalidad de **Calculadora de Rentabilidad de Factoring** dentro del proyecto actual. La lógica debe seguir los estándares de **Angular 19**, utilizando **Signals** para la reactividad y una arquitectura de servicios limpia.

#### 1. Modelo de Datos

La funcionalidad recibirá un array de objetos basado en la siguiente interfaz (proveniente del JSON de Prestamype):

```typescript
export interface FactoringOpportunity {
  _id: string;
  client: {
    name: string;
    rating: 'A+' | 'A' | 'B' | 'C' | 'D';
  };
  target_amount: number;
  currency: string;
  financing_interest_rate: number; // TEA Bruta (ej. 0.1335)
  payment_date: string; // ISO Date
}
```

#### 2. Lógica de Negocio (Service)

Crea un servicio que realice los cálculos financieros siguiendo estas fórmulas estrictas (considerando año comercial de 360 días):

- **Días restantes ($d$):** Diferencia entre `payment_date` y la fecha actual.
- **Ganancia Bruta ($G_B$):**
  $$G_B = Monto\_Invertido \times ((1 + TEA)^{d/360} - 1)$$
- **Deducciones:**
  - **Comisión de Éxito:** $10\%$ de $G_B$.
  - **IGV (18%):** Aplicado sobre la Comisión de Éxito.
  - **Impuesto a la Renta:** $5\%$ de $G_B$.
- **Ganancia Neta:** $G_B - (Comisión + IGV + Impuesto\_Renta)$.
- **TEA Neta Real:** Tasa anualizada resultante de la Ganancia Neta en el periodo $d$.

#### 3. Requerimientos del Componente

- **Inputs Reactivos:** El usuario debe poder ingresar un `monto_inversión` (Signal) y una `tea_plazo_fijo_referencia` (Signal).
- **Tabla Comparativa:** Generar una vista que recorra el array de facturas y muestre una comparativa contra un **Plazo Fijo** tradicional.
- **Visualización:**
  - Mostrar el nombre del cliente y su riesgo.
  - Comparar en dos columnas: "Inversión Factoring (Neto)" vs "Plazo Fijo (Neto)".
  - Resaltar con un badge la opción más rentable para cada fila.
- **Zoneless/Signals:** Asegúrate de no utilizar `ChangeDetectorRef`. Toda la actualización de la UI debe depender de los `computed` signals derivados de los inputs del usuario y el array de datos.

#### 4. Ejemplo de Cálculo de Validación

Si invierto **S/ 30,000** en una factura con **TEA 13.35%** y faltan **54 días**:

1.  **Ganancia Bruta:** ~S/ 573.45
2.  **Comisión (10%):** S/ 57.35
3.  **IGV (18% sobre comisión):** S/ 10.32
4.  **Impuesto Renta (5%):** S/ 28.67
5.  **Ganancia Neta Final:** ~S/ 477.11

Genera el servicio, la interfaz y el componente stand-alone correspondiente siguiendo esta estructura.

---

### Notas Técnicas Adicionales

- **Precisión:** El cálculo usa interés compuesto anualizado, que es el estándar de las TEA en Perú.
- **UI:** Al pedirle que use **Signals** y **Computed**, la IA aprovechará el motor de Angular 19 para que, en cuanto cambies el monto de inversión en el input, toda la tabla se recalcule instantáneamente sin ciclos de detección pesados.

### Ejemplo del JSON

```json
[
  {
    "_id": "69ef80d8ac42becfe1f607ef",
    "request_id": "69ece036c2d67e6feec0bf16",
    "client": {
      "_id": "689513e7ea54c44dc7618a21",
      "ruc": "20515036785",
      "name": "CORPORACION DE NEGOCIOS Y DESARROLLO EMPRESARIAL SOCIEDAD  ANONIMA CERRADA",
      "trade_name": "CORPORACION DE NEGOCIOS Y DESARROLLO EMPRESARIAL",
      "rating": "D"
    },
    "target_amount": 78946.85,
    "currency": "USD",
    "code": "69cOdFur",
    "product": "factoring",
    "financing_interest_rate": 0.0105,
    "payment_date": "2026-06-27T05:00:00.000Z",
    "percentage_financed": 6.59,
    "to_close_at": "2026-05-05T04:00:00.000Z",
    "promotion_warranty_applied": false,
    "investor_type": "mixto"
  }
]
```
