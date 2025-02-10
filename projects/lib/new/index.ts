export {
    type DefaultModuleImport,
    type G11nLocale,
    type G11nOptions,
    G11nDebug,
    currentLanguage,
    setLanguage
} from '@hug/ngx-g11n/internal';

export { G11nModule } from './ngx-g11n.module';

export { provideG11n, withOptions, withInterceptor, withLocales } from './ngx-g11n.provider';
