import { HttpClientModule } from '@angular/common/http';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { G11nDebug, G11nModule, withInterceptor, withOptions } from '@hug/ngx-g11n';
import { withDefaultLocales } from '@hug/ngx-g11n/locales';
import { withDateFnsMaterial } from '@hug/ngx-g11n/material';

import { routes } from './app.routes';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
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
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        G11nModule.forRoot(
            withOptions({ debug: G11nDebug.NO_DEBUG }),
            withInterceptor(),
            withDefaultLocales(),
            withDateFnsMaterial()
        )
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
