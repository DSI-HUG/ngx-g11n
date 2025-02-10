import { DefaultModuleImport } from './default-module-import.model';

export interface G11nLocale {
    base: () => DefaultModuleImport;
    extra?: () => DefaultModuleImport;
    datefns?: () => DefaultModuleImport;
}
