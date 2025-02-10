import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { G11nDebug, provideG11n, withInterceptor, withOptions } from '@hug/ngx-g11n';
import { withDefaultLocales } from '@hug/ngx-g11n/locales';
import { withDateFnsMaterial } from '@hug/ngx-g11n/material';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(),
        provideAnimations(),
        provideRouter(routes),
        provideG11n(
            withDefaultLocales(),
            withDateFnsMaterial(),
            withInterceptor(),
            withOptions({
                debug: G11nDebug.NO_DEBUG
            })
        )
    ]
};
