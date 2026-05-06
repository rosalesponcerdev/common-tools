---
name: angular21-architecture
description: >
  Guía de arquitectura enterprise para proyectos Angular 21+ con arquitectura hexagonal,
  DDD pragmático, Signals, standalone components, OnPush y zoneless. Usar este skill
  siempre que el usuario hable de estructurar, diseñar o implementar cualquier feature,
  componente, servicio, repositorio, caso de uso, facade, o capa de la aplicación Angular.
  También activar cuando se mencionen patterns como ports/adapters, clean architecture,
  use cases, domain layer, application layer, infrastructure, presentation, o cuando
  el usuario pida ayuda con testing en Angular. Activar incluso si la pregunta parece
  simple como "¿cómo nombro este archivo?" o "¿dónde va esta lógica?".
---

# Angular 21 — Arquitectura Enterprise Moderna

Guía de referencia para aplicaciones Angular siguiendo arquitectura hexagonal, DDD pragmático y APIs modernas de Angular.

## Regla de Dependencias (NUNCA violar)

```
Presentation → Application → Domain
Infrastructure implementa puertos del Domain

Domain NUNCA depende de: Angular · HttpClient · RxJS · UI
Application NUNCA depende de: HttpClient · HTTP · Angular DI directamente
```

## Estructura de Feature (siempre feature-based)

```
features/[nombre]/
├── domain/
│   ├── [nombre].entity.ts          # Entidad con lógica de negocio pura
│   ├── [nombre].value-object.ts    # Value objects inmutables
│   ├── [nombre].repository.ts      # Puerto como abstract class
│   └── [nombre].errors.ts          # Errores de dominio tipados
├── application/
│   ├── [verbo]-[nombre].use-case.ts  # Un use case = una acción
│   └── dtos/
│       ├── [nombre]-request.dto.ts
│       └── [nombre]-response.dto.ts
├── infrastructure/
│   ├── [nombre]-http.repository.ts   # Implementa el puerto
│   ├── [nombre]-api.mapper.ts        # API ↔ Domain
│   └── [nombre]-mock.repository.ts   # Para tests
├── presentation/
│   ├── pages/[nombre].page.ts        # Smart component
│   ├── components/[nombre].component.ts  # Dumb component
│   └── facades/[nombre].facade.ts    # Signals + orquestación UI
├── [nombre].routes.ts
└── [nombre].providers.ts
```

## Decisiones rápidas

| Pregunta                                  | Respuesta                                                    |
| ----------------------------------------- | ------------------------------------------------------------ |
| ¿Dónde va la lógica de negocio?           | `domain/` — en la entidad o value object                     |
| ¿Dónde va la llamada HTTP?                | `infrastructure/` — en el repository adapter                 |
| ¿Dónde va el estado UI?                   | `presentation/facades/` — con Signals                        |
| ¿Interface o abstract class para puertos? | Siempre `abstract class` (Angular DI necesita runtime token) |
| ¿Signals o RxJS?                          | Signals para estado; RxJS para streams async complejos       |
| ¿OnPush siempre?                          | Sí, sin excepción                                            |

## Patrones clave a seguir siempre

- **Entidades inmutables**: métodos que retornan nueva instancia, no mutar `this`
- **Use cases con responsabilidad única**: un método `execute()`, un propósito
- **Facade = único punto de contacto entre UI y use cases**
- **Mapper obligatorio** cuando hay API externa (nunca exponer raw API al dominio)
- **Providers scoped al route** con `providers: [...]` en las rutas, no `providedIn: 'root'`

## Angular 21 APIs modernas (usar siempre)

```typescript
// DI
private readonly service = inject(MyService);   // no constructor injection

// Inputs/Outputs
readonly data = input.required<Type>();          // no @Input()
readonly event = output<Type>();                 // no @Output() EventEmitter

// Control flow en templates
@if / @else / @for (track item.id) / @switch    // no *ngIf / *ngFor

// Estado reactivo
readonly count = signal(0);
readonly doubled = computed(() => this.count() * 2);
effect(() => { /* side effects */ });

// Async data
readonly data = resource({ request: () => id(), loader: async ({request}) => fetch(...) });
```

## Convenciones de nomenclatura

```
[nombre].entity.ts          → Entidad de dominio
[nombre].value-object.ts    → Value object
[nombre].repository.ts      → Puerto (abstract class)
[nombre].errors.ts          → Errores de dominio
[verbo]-[nombre].use-case.ts → Caso de uso (ej: create-order.use-case.ts)
[nombre]-http.repository.ts → Adapter HTTP concreto
[nombre]-api.mapper.ts      → Mapper API ↔ Domain
[nombre].facade.ts          → Facade con Signals
[nombre].page.ts            → Smart component (page)
[nombre].component.ts       → Dumb component
[nombre].providers.ts       → Provider array para la feature
```

## Feature Providers Pattern

Cada feature debe exportar una función `provide*` que retorne el array de providers:

```typescript
// features/tools-dashboard/tools.providers.ts
import { Provider } from '@angular/core';
import { ToolInMemoryRepository } from './infrastructure';
import { GetToolsUseCase, FilterToolsUseCase } from './application';
import { ToolsDashboardFacade } from './presentation';
import { ToolRepository } from './domain';

export const provideTools = (): Provider[] => {
  return [
    GetToolsUseCase,
    FilterToolsUseCase,
    ToolsDashboardFacade,
    { provide: ToolRepository, useClass: ToolInMemoryRepository },
  ];
};
```

### Uso en rutas

```typescript
// features/tools-dashboard/tools.routes.ts
import { Routes } from '@angular/router';
import { provideTools } from './tools.providers';

export const TOOLS_ROUTES: Routes = [
  {
    path: '',
    providers: provideTools(),
    loadComponent: () =>
      import('./presentation/pages/tools-dashboard.page').then((m) => m.ToolsDashboardPage),
  },
];
```

## Referencias detalladas

Para implementaciones completas con código, ver:

- `references/domain-layer.md` — Entidades, value objects, puertos, errores
- `references/application-layer.md` — Use cases, DTOs, orquestación
- `references/infrastructure-layer.md` — Mappers, repositorios HTTP, mock repos
- `references/presentation-layer.md` — Facades, pages, components, providers
- `references/testing.md` — Estrategia TDD, ejemplos Jest por capa
- `references/antipatterns.md` — Anti-patrones con código antes/después
