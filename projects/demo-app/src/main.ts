/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';

const USE_STANDALONE = false;

void (async (): Promise<void> => {
    if (USE_STANDALONE) {
        const { appConfig } = await import('./app/app.config');
        bootstrapApplication(AppComponent, appConfig)
            .catch((err: unknown) => console.error(err));
    } else {
        platformBrowserDynamic()
            .bootstrapModule(AppModule)
            .catch((err: unknown) => console.error(err));
    }
})();
