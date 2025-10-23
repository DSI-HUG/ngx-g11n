import { type ModuleWithProviders, NgModule } from '@angular/core';
import type { G11nFeature } from '@hug/ngx-g11n/internal';

import { provideG11n } from './ngx-g11n.provider';

@NgModule()
export class G11nModule {
    public static forRoot(...features: G11nFeature[]): ModuleWithProviders<G11nModule> {
        return {
            ngModule: G11nModule,
            providers: [
                provideG11n(...features)
            ]
        };
    }
}
