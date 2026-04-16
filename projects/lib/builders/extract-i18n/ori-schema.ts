/* eslint-disable */

/**
 * @description
 * This file contains the official Angular ExtractI18nOptions schema, copied from:
 * - node_modules/@angular/build/src/builders/extract-i18n/schema.d.ts
 *
 * [WHY]
 * Because there are actually two official builders: @angular-devkit/build-angular and @angular/build.
 * So we can't rely on a direct import from either of them, we have to copy the whole schema here.
 *
 * [IMPORTANT NOTICE]
 * When copied over always remember to remove the 'declare' keyword in the enums.
 * Otherwise the builder will not work at runtime.
 */

// ---------------------------------------------------------------------------------------------------

/**
 * Extract i18n target options for Build Facade.
 */
export type Schema = {
    /**
     * A builder target to extract i18n messages in the format of
     * `project:target[:configuration]`. You can also pass in more than one configuration name
     * as a comma-separated list. Example: `project:target:production,staging`.
     */
    buildTarget?: string;
    /**
     * Output format for the generated file.
     */
    format?: Format;
    /**
     * How to handle duplicate translations.
     */
    i18nDuplicateTranslation?: I18NDuplicateTranslation;
    /**
     * Name of the file to output.
     */
    outFile?: string;
    /**
     * Path where output will be placed.
     */
    outputPath?: string;
    /**
     * Log progress to the console.
     */
    progress?: boolean;
};
/**
 * Output format for the generated file.
 */
export enum Format {
    Arb = "arb",
    Json = "json",
    LegacyMigrate = "legacy-migrate",
    Xlf = "xlf",
    Xlf2 = "xlf2",
    Xlif = "xlif",
    Xliff = "xliff",
    Xliff2 = "xliff2",
    Xmb = "xmb"
}
/**
 * How to handle duplicate translations.
 */
export enum I18NDuplicateTranslation {
    Error = "error",
    Ignore = "ignore",
    Warning = "warning"
}
