# Smart Shopping - Design System

## Theme Configuration (Tailwind v4)

Colores definidos en `src/styles.css` con soporte automático para dark mode:

```css
@theme {
  /* Core Colors - High Contrast */
  --color-app-bg: #f8f9fa;
  --color-app-surface: #ffffff;
  --color-app-text: #111827;
  --color-app-text-secondary: #4b5563;
  --color-app-muted: #6b7280;
  --color-app-border: #e5e7eb;

  /* Brand Colors */
  --color-app-primary: #059669; /* Emerald 600 */
  --color-app-primary-hover: #047857;
  --color-app-primary-light: #d1fae5;

  /* Accent Colors */
  --color-app-success: #059669;
  --color-app-success-light: #d1fae5;
  --color-app-warning: #d97706;
  --color-app-warning-light: #fef3c7;
  --color-app-error: #dc2626;
  --color-app-error-light: #fee2e2;

  /* Dark Mode */
  --color-app-dark-bg: #0f172a; /* Slate 900 */
  --color-app-dark-surface: #1e293b; /* Slate 800 */
  --color-app-dark-text: #f1f5f9;
  --color-app-dark-text-secondary: #cbd5e1;
  --color-app-dark-muted: #94a3b8;
  --color-app-dark-border: #334155;
  --color-app-dark-primary: #34d399;
  --color-app-dark-primary-hover: #6ee7b7;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Geist Mono', monospace;
}
```

## Approach: Utilities Direct in Templates

En Tailwind v4, el approach recomendado es usar utilities directamente en los templates en lugar de crear clases custom con `@apply`.

### Paleta de Colores a Usar

**Light Mode:**

- Background: `bg-gray-50` o `bg-white`
- Text: `text-gray-900` (principal), `text-gray-500-600` (secundario)
- Borders: `border-gray-200`
- Primary: `bg-emerald-600`, `text-emerald-600`
- Success: `bg-emerald-100`, `text-emerald-700`

**Dark Mode:**

- Background: `dark:bg-slate-900`, `dark:bg-slate-800`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-slate-700`
- Primary: `dark:bg-emerald-500`, `dark:text-emerald-400`

### Ejemplo de Componente

```html
<!-- Card -->
<div
  class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 shadow-sm"
>
  <!-- Input -->
  <input
    class="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
  />

  <!-- Button Primary -->
  <button
    class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors dark:bg-emerald-500 dark:hover:bg-emerald-400"
  >
    Agregar
  </button>

  <!-- Badge Best Price -->
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-emerald-600 dark:bg-emerald-500 rounded-md"
  >
    <svg class="w-3 h-3">...</svg>
    Mejor
  </span>
</div>
```

## Responsive Breakpoints

| Breakpoint | Min Width | Uso              |
| ---------- | --------- | ---------------- |
| default    | -         | Mobile (< 640px) |
| sm         | 640px     | Small tablets    |
| lg         | 1024px    | Desktop          |

## Animations

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}
```

## Dark Mode

Tailwind v4 usa `prefers-color-scheme` por defecto. No requiere configuración adicional.

### patrón de uso

```html
<!-- Background -->
<div class="bg-gray-50 dark:bg-slate-900">
  <!-- Text -->
  <p class="text-gray-900 dark:text-white">
    <!-- Border -->
  </p>

  <div class="border border-gray-200 dark:border-slate-700">
    <!-- Elementos específicos -->
    <button class="bg-emerald-600 dark:bg-emerald-500"></button>
  </div>
</div>
```

## Best Practices

1. **Usar Emerald para success/ahorro** - Color primario de la app
2. **Usar Slate para dark mode** - Más suave que pure black
3. **Sempre agregar variants dark:** - `dark:bg-*`, `dark:text-*`, etc.
4. **Focus rings** - Siempre con `focus:ring-2 focus:ring-emerald-500/50`
5. **Transiciones** - Usar `transition-colors` en interactive elements
