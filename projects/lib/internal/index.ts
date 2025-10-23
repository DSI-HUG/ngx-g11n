
import { InjectionToken } from '@angular/core';

import type { G11nLocale, G11nOptions } from './models';

export const LOCALES = new InjectionToken<Record<string, G11nLocale>>('LOCALES');
export const G11N_OPTIONS = new InjectionToken<G11nOptions>('G11N_OPTIONS');

export { currentLanguage, DEFAULT_OPTIONS, init, setLanguage } from './main';
export {
    type DefaultModuleImport,
    G11nDebug,
    type G11nFeature,
    type G11nLocale,
    type G11nOptions
} from './models';
