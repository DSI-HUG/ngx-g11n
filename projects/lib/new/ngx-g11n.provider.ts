import {
    type HttpEvent, type HttpHandlerFn, type HttpRequest, provideHttpClient, withInterceptors
} from '@angular/common/http';
import { type EnvironmentProviders, inject, LOCALE_ID, makeEnvironmentProviders, type Provider } from '@angular/core';
import {
    DEFAULT_OPTIONS, G11N_OPTIONS, type G11nFeature, type G11nLocale, type G11nOptions, init, LOCALES
} from '@hug/ngx-g11n/internal';
import { Observable } from 'rxjs';

export const withInterceptor = (): G11nFeature<EnvironmentProviders> => ({
    providers: [
        provideHttpClient(withInterceptors([
            (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
                const headers = req.headers.set('Accept-Language', inject(LOCALE_ID));
                return next(req.clone({ headers }));
            }
        ]))
    ]
});

export const withLocales = (locales: Record<string, G11nLocale>): G11nFeature => ({
    providers: [
        { provide: LOCALES, useValue: locales }
    ]
});

export const withOptions = (options: G11nOptions): G11nFeature => ({
    providers: [
        { provide: G11N_OPTIONS, useValue: { ...DEFAULT_OPTIONS, ...options } }
    ]
});

export const provideG11n = (...features: G11nFeature<Provider | EnvironmentProviders>[]): EnvironmentProviders =>
    makeEnvironmentProviders([
        init(),
        features.map(feature => feature.providers)
    ]);
