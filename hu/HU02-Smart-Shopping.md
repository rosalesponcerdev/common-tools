## Esta es una herramienta de **Smart Shopping** enfocada en el ahorro mediante la normalización de precios. Aquí tienes la **User Story (HU)** detallada

## 1. Historia de Usuario (HU)

**Título:** Comparador de Valor Unitario para Compras de Supermercado

**Como:** Usuario que busca optimizar su presupuesto.
**Quiero:** Registrar productos y sus diversas presentaciones (marcas, tamaños y precios).
**Para:** Identificar qué opción es realmente la más barata basándome en el precio por unidad de medida (kg, gr, litro, unidad, etc.) y no solo en el precio de etiqueta.

### Criterios de Aceptación:

1.  **Registro de Producto Maestro:** Permitir crear un producto general (ej: "Arroz", "Detergente").
2.  **Gestión de Presentaciones:** Dentro de cada producto, permitir agregar múltiples presentaciones incluyendo:
    - Marca.
    - Cantidad/Tamaño (ej: 900, 5, 1).
    - Unidad de Medida (gr, kg, ml, lt, unidades).
    - Precio de venta.
3.  **Cálculo Automático de Valor Unitario:**
    - La herramienta debe normalizar los precios (ej: si hay una bolsa de 750gr y otra de 1kg, ambas deben mostrar el precio por 1kg o por 100gr para comparar).
    - Fórmulas de conversión automáticas entre unidades del mismo tipo (gr $\leftrightarrow$ kg, ml $\leftrightarrow$ lt).
4.  **Visualización y Ordenamiento:**
    - Mostrar una tabla comparativa por producto.
    - Permitir ordenar de menor a mayor por "Valor Unitario".
    - Resaltar visualmente la opción "Más Económica".
5.  **Persistencia Simple:** Los datos deben manejarse de forma reactiva (Signals) y permitir filtros por nombre de marca o precio.

---

## 2. Prompt para la IA (Copia y Pega)

Implementa un módulo de **Comparación de Precios de Supermercado** en el proyecto actual, siguiendo los estándares de **Angular 19, Signals y Zoneless**.

### Objetivo

Crear una herramienta que permita registrar productos maestros y comparar sus presentaciones para encontrar el menor costo por unidad de medida.

### Requerimientos Técnicos

1.  **Estructura de Datos (Interfaces):**

```typescript
export type UnitOfMeasure = 'gr' | 'kg' | 'ml' | 'lt' | 'unid';

export interface Presentation {
  id: string;
  brand: string;
  quantity: number;
  unit: UnitOfMeasure;
  price: number;
  unitPrice?: number; // Calculado: precio / cantidad (normalizado)
}

export interface Product {
  id: string;
  name: string;
  presentations: Presentation[];
}
```

2.  **Lógica de Normalización (Service):**
    Implementa un método que calcule el `unitPrice` de forma estandarizada:

- Si la unidad es **gr o kg**, normalizar a **Precio por kg**.
- Si la unidad es **ml o lt**, normalizar a **Precio por Litro**.
- Si la unidad es **unid**, calcular **Precio por Unidad**.

3.  **Componentes y UI:**

- **Formulario Maestro/Detalle:** Un input para crear el producto y un botón "Agregar Presentación" que abra un formulario (o fila editable) para ingresar marca, cantidad, unidad y precio.
- **Tabla Reactiva:** Usa un `computed` signal que tome la lista de presentaciones y las devuelva ordenadas automáticamente por el `unitPrice` más bajo.
- **Filtros:** Añade un input de búsqueda para filtrar marcas dentro de la tabla.

4.  **UX de Usuario:**

- Usa colores para diferenciar: la opción más barata debe tener un fondo verde suave o un icono de "Mejor Opción".
- Asegúrate de que al cambiar el precio de una presentación, el `unitPrice` y el orden de la tabla se actualicen instantáneamente usando **Signals**.

5.  **Estilo:**
    Usa un diseño limpio, preferiblemente con tablas responsivas, ideal para ser consultado desde un celular mientras se está en el supermercado.

---

### Ejemplo de uso para la lógica de la IA:

- **Producto:** Arroz.
  - Opción A: Marca "Costeño", 750gr a S/ 3.50.
  - Opción B: Marca "Metro", 1kg a S/ 4.20.
- **Resultado esperado:** La herramienta debe mostrar que la Opción B es más barata por kilo (S/ 4.20/kg) vs la Opción A (S/ 4.66/kg).

Genera el servicio de lógica, las interfaces y el componente principal con esta funcionalidad.
