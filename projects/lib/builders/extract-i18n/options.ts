import type { Schema } from './ori-schema';

export interface Options extends Schema {
    /**
     * Whether ignored translations should be written to a separate backup file.
     * @default false
     */
    backupIgnoredTranslations?: boolean;

    /**
     * One or more key patterns to ignore during the extraction.
     * Patterns are treated as regular expressions and matched against translation keys.
     * @default []
     */
    ignoreKeyPatterns?: string[];
}
