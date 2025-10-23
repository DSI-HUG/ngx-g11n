/// <reference types="@angular/localize" />

import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';

const USE_STANDALONE = true;

void (async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (USE_STANDALONE) {
        const { appConfig } = await import('./app/app.config');
        bootstrapApplication(AppComponent, appConfig)
            .catch((err: unknown) => {
                console.error(err);
            });
    } else {
        platformBrowser()
            .bootstrapModule(AppModule)
            .catch((err: unknown) => {
                console.error(err);
            });
    }
})();
