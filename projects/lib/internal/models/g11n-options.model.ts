import { G11nDebug } from './g11n-debug.enum';

export interface G11nOptions {
    defaultLanguage?: string;
    defaultCurrency?: string;
    useNavigatorLanguage?: boolean;
    loadLocaleExtra?: boolean;
    translationsPath?: string;
    queryParamName?: string;
    storage?: Storage;
    debug?: G11nDebug;
}
