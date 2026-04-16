import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, parse, resolve } from 'node:path';

import type { Options } from './options';
import { Format } from './ori-schema';

export const execute = async (options: Options, context: BuilderContext): Promise<BuilderOutput> => {
    try {
        const projectName = context.target?.project;
        if (!projectName) {
            throw new Error('The builder requires a target.');
        }

        await runExtractI18nBuilder(context, projectName, options);
        await runExtractedFileCleanUp(context, options);

        return { success: true };
    } catch (error: unknown) {
        context.logger.error(normalizeError(error));
        return { success: false };
    }
};

// --- HELPER(s) ---

const runExtractedFileCleanUp = async (context: BuilderContext, options: Options): Promise<void> => {
    context.logger.info('\n🚀 [2/2] Cleaning extracted translations...');

    if (options.format !== Format.Json) {
        context.logger.warn('→ (skipped) Not a JSON format.');
        return;
    }
    if (options.ignoreKeyPatterns?.length === 0) {
        context.logger.warn('→ (skipped) No ignoreKeyPatterns provided.');
        return;
    }

    const outDir = (options.outputPath) ? join(context.workspaceRoot, options.outputPath) : context.workspaceRoot;
    const outFile = resolve(outDir, options.outFile ?? 'messages.json');

    if (existsSync(outFile)) {
        context.logger.info(`→ Reading file for cleanup: ${outFile}`);
        const data = JSON.parse(await readFile(outFile, 'utf-8')) as Record<'translations', string[]>;
        if (Object.hasOwn(data, 'translations')) {
            const regexList = options.ignoreKeyPatterns?.map(pattern => new RegExp(`^${pattern}$`)) ?? [];
            const { matched, remaining } = Object.entries(data.translations).reduce(
                (acc, [key, value]) => {
                    const match = regexList.some(rx => rx.test(key));
                    (match ? acc.matched : acc.remaining)[key] = value;
                    return acc;
                },
                { matched: {} as Record<string, string>, remaining: {} as Record<string, string> },
            );

            if (Object.keys(matched).length) {
                context.logger.info(`→ Saving cleaned data to: ${outFile}`);
                await writeFile(outFile, JSON.stringify({ ...data, translations: remaining }, null, 4), 'utf-8');

                if (options.backupIgnoredTranslations) {
                    const now = new Date();
                    const timestamp = [
                        now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(),
                    ].map(n => String(n).padStart(2, '0')).join('');
                    const outBakFile = resolve(outDir, `${parse(outFile).name}_${timestamp}.bak.json`);

                    context.logger.info(`→ Saving matching keys to: ${outBakFile}`);
                    await writeFile(outBakFile, JSON.stringify({ ...data, translations: matched }, null, 4), 'utf-8');
                }
            } else {
                context.logger.warn('→ (skipped) No matching keys to clean.');
            }

        } else {
            context.logger.warn('→ (skipped) No "translations" property found in file.');
            return;
        }
    } else {
        context.logger.warn(`→ (skipped) Extracted file not found at ${outFile}`);
        return;
    }

    context.logger.info('✔ Cleanup Complete.');
};

const runExtractI18nBuilder = async (context: BuilderContext, projectName: string, options: Options): Promise<void> => {
    context.logger.info(`🚀 [1/2] Running Angular extract-i18n for project "${projectName}"...`);

    // Normalize options to only keep keys that are really defined
    const builderOptions = Object.fromEntries(
        ['buildTarget', 'format', 'i18nDuplicateTranslation', 'outFile', 'outputPath', 'progress']
            .filter((key): key is keyof Options => key in options)
            .map(key => [key, options[key]]),
    ) as Partial<Options>;

    const extraction = await context.scheduleBuilder(
        resolveExtractI18nBuilder(),
        builderOptions,
        { target: context.target },
    );

    const extractionResult = await extraction.result;
    if (!extractionResult.success) {
        throw new Error('Failed to execute extract-i18n.');
    }
};

const resolveExtractI18nBuilder = (): string => {
    try {
        require.resolve('@angular/build/package.json');
        return '@angular/build:extract-i18n';
    } catch {
        return '@angular-devkit/build-angular:extract-i18n';
    }
};

const normalizeError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    }
    return 'Unknown error occurred';
};
