/* eslint-disable @typescript-eslint/naming-convention */
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { G11nDebug, G11nModule, withInterceptor, withLocales, withOptions } from '@hug/ngx-g11n';
import { withDateFnsMaterial } from '@hug/ngx-g11n/material';

import { routes } from './app.routes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent { }

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

@NgModule({
    declarations: [
        AppComponent
    ],
    providers: [
        provideHttpClient(withInterceptorsFromDi())
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        G11nModule.forRoot(
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
