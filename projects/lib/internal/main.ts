/* eslint-disable @typescript-eslint/naming-convention */
import { registerLocaleData } from '@angular/common';
import { APP_INITIALIZER, DEFAULT_CURRENCY_CODE, inject, LOCALE_ID, type Provider } from '@angular/core';
import { loadTranslations } from '@angular/localize';

import { G11N_OPTIONS, LOCALES } from '.';
import { G11nDebug, type G11nFile, type G11nLocale, type G11nOptions } from './models';

const STORAGE_KEY = 'hug-ngx-g11n:lang';
let QUERY_PARAM_NAME = 'lang';
let FORCE_DEBUG = G11nDebug.NO_DEBUG;

/**
 * @internal
 */
export const DEFAULT_OPTIONS: G11nOptions = {
    defaultLanguage: 'fr-CH',
    defaultCurrency: 'CHF',
    useNavigatorLanguage: true,
    loadLocaleExtra: false,
    translationsPath: '/translations',
    queryParamName: QUERY_PARAM_NAME,
    storage: localStorage,
    debug: G11nDebug.NO_DEBUG
};

// ---

export const currentLanguage = (): string => inject(LOCALE_ID);

export const setLanguage = (value: string): void => {
    refreshUrl(value);
    location.reload();
};

// --- HELPER(s) ---

const loadTranslationFile = async (filePath: string, debug: G11nDebug = G11nDebug.NO_DEBUG): Promise<void> => {
    const debugMode = (FORCE_DEBUG !== G11nDebug.NO_DEBUG) ? FORCE_DEBUG : debug;
    if (debugMode !== G11nDebug.NO_TRANSLATIONS) {
        const response = await fetch(filePath);
        const { translations } = await response.json() as G11nFile;
        if (translations) {
            if (debugMode === G11nDebug.SHOW_KEYS) {
                Object.entries(translations).forEach(([key, value]) => {
                    translations[key] = `${value} (@${key})`;
                });
            } else if (debugMode === G11nDebug.DUMMY_TRANSLATIONS) {
                Object.keys(translations).forEach(key => translations[key] = '-');
            }
            loadTranslations(translations);
        } else {
            throw new Error(`[@hug/ngx-g11n] No translations found in file: ${filePath}`);
        }
    }
};

const refreshUrl = (localeId: string): void => {
    const newUrl = new URL(location.href);
    newUrl.searchParams.set(QUERY_PARAM_NAME, localeId);
    history.pushState({}, '', newUrl); // update URL without reload
};

const loadLanguage = async (localeId: string, locales: Record<string, G11nLocale>, options: G11nOptions): Promise<void> => {
    // Sync language
    document.documentElement.lang = localeId;
    options.storage?.setItem(STORAGE_KEY, localeId);
    refreshUrl(localeId);

    // Register locale data
    const locale = locales[localeId];
    const localeBase = (await locale.base()).default;
    const localeExtra = (options.loadLocaleExtra && locale.extra) ? (await locale.extra()).default : undefined;
    registerLocaleData(localeBase, localeId, localeExtra);

    // Load translations
    await loadTranslationFile(`${options.translationsPath}/${localeId}.json`, options.debug);
};

const getLocaleToUse = (locales: Record<string, G11nLocale>, options: G11nOptions): string => {
    const localeIsSupported = (id: string): boolean => id in locales;

    // Priority 1 : query param
    const localeIdFromUrl = new URL(location.href).searchParams.get(options.queryParamName!);
    if (localeIdFromUrl) {
        if (localeIdFromUrl === 'keys') {
            FORCE_DEBUG = G11nDebug.SHOW_KEYS;
        } else if (localeIdFromUrl === 'dummy') {
            FORCE_DEBUG = G11nDebug.DUMMY_TRANSLATIONS;
        } else if (localeIsSupported(localeIdFromUrl)) {
            return localeIdFromUrl;
        } else {
            console.warn(`[@hug/ngx-g11n] Locale ${localeIdFromUrl} from url is not supported (will use storage if found)`);
        }
    }

    // Priority 2 : storage
    const localeIdFromStorage = options.storage?.getItem(STORAGE_KEY);
    if (localeIdFromStorage) {
        if (localeIsSupported(localeIdFromStorage)) {
            return localeIdFromStorage;
        } else {
            console.warn(`[@hug/ngx-g11n] Locale ${localeIdFromStorage} from storage is not supported (will use navigator if enabled)`);
        }
    }

    // Priority 3 : browser
    if (options.useNavigatorLanguage) {
        if (localeIsSupported(navigator.language)) {
            return navigator.language;
        } else {
            console.warn(`[@hug/ngx-g11n] Locale ${navigator.language} from browser is not supported (will use default setting)`);
        }
    }

    // Priority 4 : default setting
    if (options.defaultLanguage && localeIsSupported(options.defaultLanguage)) {
        return options.defaultLanguage;
    }

    throw new Error(`[@hug/ngx-g11n] Locale ${options.defaultLanguage} is not supported`);
};

/**
 * @internal
 */
export const init = (): Provider[] => [
    {
        provide: G11N_OPTIONS,
        useValue: DEFAULT_OPTIONS
    },
    {
        provide: LOCALE_ID,
        useFactory: getLocaleToUse,
        deps: [LOCALES, G11N_OPTIONS]
    },
    {
        provide: DEFAULT_CURRENCY_CODE,
        useFactory: (options: G11nOptions) => options.defaultCurrency ?? DEFAULT_OPTIONS.defaultCurrency,
        deps: [G11N_OPTIONS]
    },
    {
        provide: APP_INITIALIZER,
        useFactory: (localeId: string, locales: Record<string, G11nLocale>, options: G11nOptions) =>
            async (): Promise<void> => {
                QUERY_PARAM_NAME = options.queryParamName ?? DEFAULT_OPTIONS.queryParamName!;
                await loadLanguage(localeId, locales, options);
            },
        deps: [LOCALE_ID, LOCALES, G11N_OPTIONS],
        multi: true
    }
];
