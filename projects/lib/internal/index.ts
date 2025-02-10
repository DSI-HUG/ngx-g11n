/* eslint-disable @typescript-eslint/naming-convention */
import { InjectionToken } from '@angular/core';

import type { G11nLocale, G11nOptions } from './models';

export const LOCALES = new InjectionToken<Record<string, G11nLocale>>('LOCALES');
export const G11N_OPTIONS = new InjectionToken<G11nOptions>('G11N_OPTIONS');

export {
    type DefaultModuleImport,
    type G11nLocale,
    type G11nOptions,
    type G11nFeature,
    G11nDebug
} from './models';

export { currentLanguage, setLanguage, init, DEFAULT_OPTIONS } from './main';
