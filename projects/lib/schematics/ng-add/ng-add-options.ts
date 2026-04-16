export interface NgAddOptions {
    project: string;
    defaultLanguage: string;
    defaultCurrency: string;
    useNavigatorLanguage: boolean;
    loadLocaleExtra: boolean;
    rootTranslationsPath: string;
    translationScopes: string[];
    queryParamName: string;
    material: boolean;
    interceptor: boolean;
    defaultLocales: boolean;
    useEnhancedBuilder: boolean;
}
