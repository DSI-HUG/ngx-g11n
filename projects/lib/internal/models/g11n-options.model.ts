import type { G11nDebug } from './g11n-debug.enum';

export interface G11nOptions {
    /**
     * The default language to use when no language is detected or provided.
     * @example 'en', 'fr-CH'
     * @default 'fr-CH'
     */
    defaultLanguage?: string;

    /**
     * The default currency code used for formatting values.
     * Must be a valid ISO 4217 currency code.
     * @example 'USD', 'EUR', 'CHF'
     * @default 'CHF'
     */
    defaultCurrency?: string;

    /**
     * Whether to automatically detect and use the browser's language (via navigator.language).
     * @default true
     */
    useNavigatorLanguage?: boolean;

    /**
     * Whether to load Angular locale extra data (e.g. pluralization rules, date formats).
     * @default false
     */
    loadLocaleExtra?: boolean;

    /**
     * Enables or disables the translation system.
     * If false, only locale-based formatting will be applied.
     * @default true
     */
    useTranslations?: boolean;

    /**
     * Root path where translation files are located.
     * @default '/translations' (or '/assets/translations' for legacy apps)
     */
    rootTranslationsPath?: string;

    /**
     * List of translation scopes to load from the root translations folder.
     * Each scope typically represents a feature/module-specific translation folder.
     * @example ['common', 'auth', 'dashboard']
     * @default []
     */
    translationScopes?: string[];

    /**
     * Name of the query parameter used to override the active language.
     * @example '?lang=en'
     * @default 'lang'
     */
    queryParamName?: string;

    /**
     * Storage mechanism used to persist user preferences.
     * Typically localStorage or sessionStorage.
     * @default localStorage
     */
    storage?: Storage;

    /**
     * Debug configuration for logging and development diagnostics.
     * @default G11nDebug.NO_DEBUG
     */
    debug?: G11nDebug;
}
