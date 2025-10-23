/* eslint-disable @typescript-eslint/naming-convention */
import { provideHttpClient } from '@angular/common/http';
import { type ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { G11nDebug, provideG11n, withInterceptor, withLocales, withOptions } from '@hug/ngx-g11n';
import { withDateFnsMaterial } from '@hug/ngx-g11n/material';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(),
        provideRouter(routes),
        provideG11n(
            withLocales({
                'fr-CH': {
                    base: () => import('@angular/common/locales/fr-CH'),
                    extra: () => import('@angular/common/locales/extra/fr-CH'),
                    datefns: () => import('date-fns/locale/fr-CH')
                },
                'de-CH': {
                    base: () => import('@angular/common/locales/de-CH'),
                    extra: () => import('@angular/common/locales/extra/de-CH'),
                    datefns: () => import('date-fns/locale/de')
                },
                'en-US': {
                    base: () => import('@angular/common/locales/en'),
                    extra: () => import('@angular/common/locales/extra/en'),
                    datefns: () => import('date-fns/locale/en-US')
                }
            }),
            withDateFnsMaterial(),
            withInterceptor(),
            withOptions({
                debug: G11nDebug.NO_DEBUG
            })
        )
    ]
};
