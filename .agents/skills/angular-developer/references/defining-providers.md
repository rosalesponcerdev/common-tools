# Defining Dependency Providers

Angular offers automatic and manual ways to provide dependencies to its Dependency Injection (DI) system.

## Automatic Provision

The most common way to provide a service is using `providedIn: 'root'` on an `@Injectable()`.

### InjectionToken

Use `InjectionToken` for non-class dependencies (configuration objects, functions, primitives). An `InjectionToken` can also be automatically provided.

```ts
import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({ apiUrl: 'https://api.example.com' }),
});
```

## Manual Provision

You use the `providers` array when a service lacks `providedIn`, when you want a new instance for a specific component, or when configuring runtime values.

```ts
@Component({
  providers: [
    // Shorthand for { provide: LocalService, useClass: LocalService }
    LocalService,

    // useClass: Swap implementations
    { provide: Logger, useClass: BetterLogger },

    // useValue: Provide static values
    { provide: API_URL_TOKEN, useValue: 'https://api.example.com' },

    // useFactory: Generate value dynamically
    {
      provide: ApiClient,
      useFactory: (http = inject(HttpClient)) => new ApiClient(http),
    },

    // useExisting: Create an alias
    { provide: OldLogger, useExisting: NewLogger },

    // multi: Provide multiple values for the same token as an array
    { provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true },
  ],
})
export class Example {}
```

## Scopes of Providers

- **Application Bootstrap**: Global singletons. Use for HTTP clients, logging, or app-wide config.
- **Component/Directive**: Isolated instances. Use for component-specific state or forms. Services are destroyed when the component is destroyed.
- **Route**: Feature-specific services loaded only with specific routes.

## Library Pattern: `provide*` functions

Library authors should export functions that return provider arrays to encapsulate configuration:

```ts
export function provideAnalytics(config: AnalyticsConfig): Provider[] {
  return [{ provide: ANALYTICS_CONFIG, useValue: config }, AnalyticsService];
}
```

## Feature Providers Pattern (Recommended)

For feature-based architecture, export a `provide*` function that returns all dependencies for the feature:

```ts
// features/tools-dashboard/tools.providers.ts
import { Provider } from '@angular/core';
import { ToolInMemoryRepository } from './infrastructure';
import { FilterToolsUseCase, GetToolByIdUseCase, GetToolsUseCase } from './application';
import { ToolsDashboardFacade } from './presentation';
import { ToolRepository } from './domain';

export const provideTools = (): Provider[] => {
  return [
    GetToolsUseCase,
    FilterToolsUseCase,
    GetToolByIdUseCase,
    ToolsDashboardFacade,
    {
      provide: ToolRepository,
      useClass: ToolInMemoryRepository,
    },
  ];
};
```

### Usage in Routes

```ts
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

### Benefits

- **Single Source**: All feature dependencies defined in one place
- **Scoped**: Providers only available when feature is loaded (lazy loading)
- **Replaceable**: Easy to swap implementations (e.g., `ToolInMemoryRepository` → `ToolHttpRepository`)
- **Testable**: Mock providers can be provided in tests by overriding

```

```
