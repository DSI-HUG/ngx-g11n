
import { APP_INITIALIZER, LOCALE_ID, type Provider } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateFnsAdapter, MAT_DATE_FNS_FORMATS } from '@angular/material-date-fns-adapter';
import { type G11nFeature, type G11nLocale, LOCALES } from '@hug/ngx-g11n/internal';
import { type Locale, setDefaultOptions } from 'date-fns';

const matDateFnsAdapter = (): Provider[] => [
    { provide: MAT_DATE_FORMATS, useValue: MAT_DATE_FNS_FORMATS },
    { provide: DateAdapter, useClass: DateFnsAdapter, deps: [MAT_DATE_LOCALE] },
    {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        provide: APP_INITIALIZER,
        useFactory: (localeId: string, locales: Record<string, G11nLocale>, dateAdapter: DateAdapter<Date, Locale>) =>
            async (): Promise<void> => {
                if (localeId in locales && locales[localeId].datefns) {
                    const locale = (await locales[localeId].datefns()).default as Locale;
                    dateAdapter.setLocale(locale);
                    setDefaultOptions({ locale });
                }
            },
        deps: [LOCALE_ID, LOCALES, DateAdapter],
        multi: true
    }
];

export const withDateFnsMaterial = (): G11nFeature => ({
    providers: [
        matDateFnsAdapter()
    ]
});
