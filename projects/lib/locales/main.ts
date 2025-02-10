/* eslint-disable @typescript-eslint/naming-convention */
import { G11nFeature, LOCALES } from '@hug/ngx-g11n/internal';

export const withDefaultLocales = (): G11nFeature => ({
    providers: [{
        provide: LOCALES,
        useValue: {
            'fr-CH': {
                base: () => import('@angular/common/locales/fr-CH'),
                extra: () => import('@angular/common/locales/extra/fr-CH'),
                datefns: () => import('date-fns/locale/fr-CH')
            },
            'de-CH': {
                base: () => import('@angular/common/locales/de-CH'),
                extra: () => import('@angular/common/locales/extra/de-CH'),
                datefns: () => import('date-fns/locale/de')
            }
        }
    }]
});
