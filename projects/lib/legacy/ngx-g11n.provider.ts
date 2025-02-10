import {
    HTTP_INTERCEPTORS, type HttpEvent, type HttpHandler, type HttpInterceptor, type HttpRequest
} from '@angular/common/http';
import { inject, Injectable, LOCALE_ID, type Provider } from '@angular/core';
import {
    DEFAULT_OPTIONS, G11N_OPTIONS, type G11nFeature, type G11nLocale, type G11nOptions, init, LOCALES
} from '@hug/ngx-g11n/internal';
import { Observable } from 'rxjs';

@Injectable()
class G11nInterceptor implements HttpInterceptor {
    public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const headers = request.headers.set('Accept-Language', inject(LOCALE_ID));
        return next.handle(request.clone({ headers }));
    }
}

export const withInterceptor = (): G11nFeature => ({
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: G11nInterceptor, multi: true }
    ]
});

export const withLocales = (locales: Record<string, G11nLocale>): G11nFeature => ({
    providers: [
        { provide: LOCALES, useValue: locales }
    ]
});

export const withOptions = (options: G11nOptions): G11nFeature => ({
    providers: [
        { provide: G11N_OPTIONS, useValue: { ...DEFAULT_OPTIONS, translationsPath: '/assets/translations', ...options } }
    ]
});

export const provideG11n = (...features: G11nFeature[]): Provider[] => [
    init(),
    withOptions({ translationsPath: '/assets/translations' }).providers,
    features.map(feature => feature.providers)
];
