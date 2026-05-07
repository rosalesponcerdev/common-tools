# Design System: Common Tools

## 1. Visual Theme & Atmosphere

Una interfaz **limpia, profesional y utilitaria** con un carácter moderno y sobrio. El diseño prioriza la claridad y la función sobre la ornamentación, transmitiendo confiabilidad y eficiencia. La paleta de colores es restringida y deliberada, creando un ambiente de trabajo productivo sin distracciones visuales.

El modo oscuro incorpora tonos slate profundos que mantienen la legibilidad mientras reducen la fatiga visual en sesiones prolongadas.

## 2. Color Palette & Roles

### Light Mode

| Color Name | Hex Code | Role |
|------------|----------|------|
| Emerald Profundo | `#059669` | Color primario para acciones principales, links y acentos de marca |
| Emerald Oscuro | `#047857` | Estado hover del color primario |
| Emerald Suave | `#d1fae5` | Fondo de badges exitosos y acentos sutiles |
| Gris Pizarra | `#111827` | Texto principal de alto contraste |
| Gris Piedra | `#4b5563` | Texto secundario para descripciones |
| Gris Ceniza | `#6b7280` | Texto terciario, placeholders |
| Borde Suave | `#e5e7eb` | Bordes de tarjetas, inputs, divisores |
| Fondo Algodón | `#f8f9fa` | Fondo general de la aplicación |
| Superficie Pura | `#ffffff` | Fondo de cards, paneles, componentes elevados |

### Semantic Colors

| Color Name | Hex Code | Role |
|------------|----------|------|
| Ámbar Cálido | `#d97706` | Advertencias, estados de precaución |
| Crema Almería | `#fef3c7` | Fondo de advertencias |
| Rojo Intenso | `#dc2626` | Errores, acciones destructivas |
| Rosa Pálido | `#fee2e2` | Fondo de errores |

### Dark Mode

| Color Name | Hex Code | Role |
|------------|----------|------|
| Emerald Luminoso | `#34d399` | Color primario en modo oscuro |
| Emerald Brillo | `#6ee7b7` | Estado hover en modo oscuro |
| Slate Carbón | `#0f172a` | Fondo principal oscuro |
| Slate Grafito | `#1e293b` | Superficie de cards y paneles |
| Blanco Hueso | `#f1f5f9` | Texto principal oscuro |
| Gris Luminoso | `#cbd5e1` | Texto secundario oscuro |
| Gris Plomo | `#94a3b8` | Texto terciario oscuro |
| Borde Carbón | `#334155` | Bordes en modo oscuro |

## 3. Typography Rules

- **Font Family**: Inter (sans-serif) para texto general, JetBrains Mono para valores numéricos y datos monospace
- **Jerarquía**:
  - Encabezados: font-semibold a font-bold
  - Texto de cuerpo: font-normal
  - Labels y badges: text-xs a text-sm, font-medium a font-semibold
- **Letter Spacing**: predeterminado (normal), text-xs con tracking wider para badges pequeños
- **Tamaños**: text-sm para formularios, text-xs para metadata, text-lg para títulos de secciones

## 4. Component Stylings

### Buttons

- **Primarios**: Fondo emerald-600 (#059669), texto blanco, rounded-lg (esquinas suavemente redondeadas), padding py-2.5 px-4. Hover: emerald-700, transición smooth.
- **Secundarios**: Borde gray-200, fondo transparente, texto gray-700. Hover: bg-gray-50.
- **Iconos**: rounded-lg, padding p-1.5 a p-2.
- **Estados**: opacity-50 y cursor-not-allowed cuando disabled.

### Cards/Containers

- **Cards principales**: Fondo white, border border-gray-100, rounded-xl (12px), shadow-sm constante, shadow-lg en hover.
- **Paneles elevados**: rounded-2xl (16px), border gray-200, padding p-6.
- **Grupos de contenido**: border-b dividers con border-gray-200 o gray-100.
- **Badges de estado**: rounded-full (pill-shaped), text-xs font-medium, colores semánticos (emerald-100 para success, red-50 para error).

### Inputs/Forms

- **Campos de texto**: bg-white, border border-gray-200, rounded-lg, padding py-2.5 px-3.5. Focus: ring-2 ring-emerald-500/50 (ring sutil semitransparente), border-emerald-500.
- **Selectores**: appearance-none con dropdown arrow personalizado.
- **Placeholders**: text-gray-400.
- **Áreas grandes**: textarea con h-40, resize-none.

### Badges y Tags

- **Estado activo**: rounded-full, px-2.5 py-1, bg-emerald-100 text-emerald-700.
- **Tags de categoría**: rounded-full, text-xs, bg-gray-100 text-gray-600 (light) o bg-slate-700 text-gray-300 (dark).
- **Contadores**: rounded-full, w-6 h-6, flex center, bg-emerald-600 text-white text-xs font-bold.

## 5. Layout Principles

- **Contenedor principal**: max-width 56rem (896px), margin auto, padding responsive (1rem mobile, 1.5rem tablet, 2rem desktop).
- **Spacing interno**: p-4 a p-6 para cards, gap-3 a gap-4 para elementos en grupo.
- **Grid**: Flexbox con gap variable, alignment center para elementos relacionados.
- **Sticky headers**: z-10 con border-b para navegación fija.
- **Transiciones**: duration-200 a duration-300 para interacciones suaves, ease-out para animaciones de entrada.
- **Animaciones**: slideIn (translateY 8px, 0.3s) y fadeIn (0.2s) para elementos que aparecen.

### Dark Mode

- Detecta automáticamente `prefers-color-scheme: dark`.
- Transiciones de color smooth mediante transition-colors.
- Componentes adaptan: bg-white → bg-slate-800, border-gray-200 → border-slate-700, text-gray-900 → text-white.