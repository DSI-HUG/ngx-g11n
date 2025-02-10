import { type Provider } from '@angular/core';

export interface G11nFeature<T = Provider> {
    providers: T[];
}
