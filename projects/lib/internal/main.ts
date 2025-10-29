/* eslint-disable @typescript-eslint/no-non-null-assertion */

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
    useTranslations: true,
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
    const debugMode = FORCE_DEBUG !== G11nDebug.NO_DEBUG ? FORCE_DEBUG : debug;
    const response = await fetch(filePath);
    if (response.status === 200) {
        const { translations } = (await response.json()) as G11nFile | Record<string, undefined>;
        if (translations) {
            if (debugMode === G11nDebug.SHOW_KEYS) {
                Object.entries(translations).forEach(([key, value]) => {
                    translations[key] = `${value} (@${key})`;
                });
            } else if (debugMode === G11nDebug.DUMMY_TRANSLATIONS) {
                Object.keys(translations).forEach(key => {
                    translations[key] = '-';
                });
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

const loadLanguage = async (
    localeId: string,
    locales: Record<string, G11nLocale>,
    options: G11nOptions
): Promise<void> => {
    // Sync language
    document.documentElement.lang = localeId;
    options.storage?.setItem(STORAGE_KEY, localeId);
    refreshUrl(localeId);

    // Register locale data
    const locale = locales[localeId];
    const localeBase = (await locale.base()).default;
    const localeExtra = options.loadLocaleExtra && locale.extra ? (await locale.extra()).default : undefined;
    registerLocaleData(localeBase, localeId, localeExtra);

    // Load translations
    if (options.useTranslations) {
        const filename = locale.translationFilename ?? `${localeId}.json`;
        await loadTranslationFile(`${options.translationsPath!}/${filename}`, options.debug);
    }
};

const getLocaleToUse = (locales: Record<string, G11nLocale>, options: G11nOptions): string => {
    const getSupportedLocaleId = (localeId: string): string | undefined => {
        // Priority 1: exact match
        if (localeId in locales) {
            return localeId;
        }
        // Priority 2: match on base language only
        const locale = new Intl.Locale(localeId);
        if (locale.language in locales) {
            console.warn(
                `[@hug/ngx-g11n] Locale "${localeId}" was not found in given locales (will use "${locale.language}" instead)`
            );
            return locale.language;
        }
        // Priority 3: match on base language with any region
        const matchedLocale = Object.keys(locales).find(key => new Intl.Locale(key).language === locale.language);
        if (matchedLocale) {
            console.warn(
                `[@hug/ngx-g11n] Locale "${localeId}" was not found in given locales (will use "${matchedLocale}" instead)`
            );
            return matchedLocale;
        }
        return undefined;
    };

    /**
     * Initialize query param name
     * We do it here as getLocaleToUse is called first in the injection tree (cf. provide: LOCALE_ID)
     */
    initQueryParamName(options);

    // Priority 1: query param
    const localeIdFromUrl = new URL(location.href).searchParams.get(QUERY_PARAM_NAME);
    if (localeIdFromUrl) {
        if (localeIdFromUrl === 'keys') {
            FORCE_DEBUG = G11nDebug.SHOW_KEYS;
        } else if (localeIdFromUrl === 'dummy') {
            FORCE_DEBUG = G11nDebug.DUMMY_TRANSLATIONS;
        } else {
            const supportedLocaleId = getSupportedLocaleId(localeIdFromUrl);
            if (supportedLocaleId) {
                return supportedLocaleId;
            } else {
                console.warn(
                    `[@hug/ngx-g11n] Locale "${localeIdFromUrl}" from url was not found in given locales (will use storage if found)`
                );
            }
        }
    }

    // Priority 2: storage
    const localeIdFromStorage = options.storage?.getItem(STORAGE_KEY);
    if (localeIdFromStorage) {
        const supportedLocaleId = getSupportedLocaleId(localeIdFromStorage);
        if (supportedLocaleId) {
            return supportedLocaleId;
        } else {
            console.warn(
                `[@hug/ngx-g11n] Locale "${localeIdFromStorage}" from storage was not found in given locales (will use navigator if enabled)`
            );
        }
    }

    // Priority 3: browser
    if (options.useNavigatorLanguage) {
        const supportedLocaleId = getSupportedLocaleId(navigator.language);
        if (supportedLocaleId) {
            return supportedLocaleId;
        } else {
            console.warn(
                `[@hug/ngx-g11n] Locale "${navigator.language}" from browser was not found in given locales (will use default setting)`
            );
        }
    }

    // Priority 4: user's setting
    if (options.defaultLanguage) {
        const supportedLocaleId = getSupportedLocaleId(options.defaultLanguage);
        if (supportedLocaleId) {
            return supportedLocaleId;
        } else {
            console.warn(
                `[@hug/ngx-g11n] Locale "${options.defaultLanguage}" from user's setting was not found in given locales`
            );
        }
    }

    throw new Error('[@hug/ngx-g11n] No provided locale was found');
};

/**
 * We have to determine the query param name and export it globally as it will be used by the refreshUrl function, which
 * do not have access to the option object. We also have to support case-insensitive cases (ex: lang, Lang, LANG, etc.).
 * @param options The G11N options.
 * @internal
 */
const initQueryParamName = (options: G11nOptions): void => {
    let value = options.queryParamName ?? DEFAULT_OPTIONS.queryParamName!;
    // eslint-disable-next-line no-loops/no-loops
    for (const key of new URL(location.href).searchParams.keys()) {
        if (key.toLowerCase() === value.toLowerCase()) {
            value = key;
        }
    }
    QUERY_PARAM_NAME = value;
};

/**
 * Initializes G11N providers.
 * @internal
 * @returns An array of Angular providers for G11N initialization.
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
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        provide: APP_INITIALIZER,
        useFactory:
            (localeId: string, locales: Record<string, G11nLocale>, options: G11nOptions) =>
                async (): Promise<void> => {
                    await loadLanguage(localeId, locales, options);
                },
        deps: [LOCALE_ID, LOCALES, G11N_OPTIONS],
        multi: true
    }
];
