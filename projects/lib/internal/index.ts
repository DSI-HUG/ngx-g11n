
import { InjectionToken } from '@angular/core';

import type { G11nLocale, G11nOptions } from './models';
import type { G11nSubmodule } from './models/g11n-submodule.model';

export const LOCALES = new InjectionToken<Record<string, G11nLocale>>('LOCALES');
export const G11N_OPTIONS = new InjectionToken<G11nOptions>('G11N_OPTIONS');
export const G11N_SUBMODULES = new InjectionToken<G11nSubmodule[]>('G11N_SUBMODULES');

export { currentLanguage, DEFAULT_OPTIONS, init, setLanguage } from './main';
export {
    type DefaultModuleImport,
    G11nDebug,
    type G11nFeature,
    type G11nLocale,
    type G11nOptions,
    type G11nSubmodule,
} from './models';
