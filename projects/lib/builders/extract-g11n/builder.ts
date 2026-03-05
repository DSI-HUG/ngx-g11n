import type { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import logging from '../logger';
import type { ExtractG11nOptions } from './extract-g11n-options';

export const execute = async (options: ExtractG11nOptions, context: BuilderContext): Promise<BuilderOutput> => {
    try {
        const projectName = context.target?.project;

        if (!projectName) {
            logging('error', context, 'Extract-g11n builder requires a target to be specified.');
            return { success: false };
        }

        const { projectType } = (await context.getProjectMetadata(projectName)) as {
            projectType?: string;
        };

        checkProjectTypeApplication(context, projectName, projectType);
        await runExtractI18nBuilder(options, context, projectName);

        if (options.format === 'json' && options.exclusionKeyPrefixes.length) {
            runExtractedFileCleanUp(options, context);
        }

        logging('success', context, 'Successfully completed extract-g11n!', false);
        return { success: true };
    } catch (err: unknown) {
        logging('error', context, normalizeError(err));
        return { success: false };
    }
};

const checkProjectTypeApplication = (context: BuilderContext, projectName: string, projectType?: string): void => {
    logging('step', context, `🔍 Checking project type for '${projectName}'…`);

    if (projectType !== 'application') {
        logging('error', context, `Tried to extract from ${projectName} with 'projectType' ${projectType || 'undefined'}, which is not supported.` +
                ' The \'extract-g11n\' builder can only extract from applications.',
        );
        throw new Error(`Project '${projectName}' is not an Angular application.`);
    }
    logging('success', context, '✔ Project type OK (application)');
};

const runExtractI18nBuilder = async (options: ExtractG11nOptions, context: BuilderContext, projectName: string): Promise<void> => {

    const extractI18nOverrides = {
        buildTarget: `${projectName}:build`,
        outputPath: options.outputPath,
        outFile: options.outFile,
        format: options.format,
    };

    const target = '@angular-devkit/build-angular:extract-i18n';
    logging('step', context, `🚀 Running Angular extract-i18n for project ${projectName}`);


    const extraction = await context.scheduleBuilder(target, extractI18nOverrides, { target: context.target });

    const extractionResult = await extraction.result;

    if (!extractionResult.success) {
        throw new Error('Failed to execute extract-i18n.');
    }
    logging('success', context, '✔ Extract-i18n completed');
};

const runExtractedFileCleanUp = (options: ExtractG11nOptions, context: BuilderContext): void => {
    logging('step', context, '🧹 Cleaning extracted JSON files…');

    const pattern = path.join(options.outputPath, '*.json');
    const files = findJsonFiles(pattern);

    Object.entries(files).forEach(([_, file]) => {
        logging('debug', context, `Processing: ${file}…`);

        const read = safeReadJson(file);

        if (read.ok) {
            const { updated, removedValues } = removeByPrefixes(read.data, options.exclusionKeyPrefixes);

            if (Object.keys(removedValues).length !== 0) {
                if (options.backUpExcludedKeys) {
                    const now = new Date();
                    const ts = [
                        String(now.getFullYear()),
                        String(now.getMonth() + 1).padStart(2, '0'),
                        String(now.getDate()).padStart(2, '0'),
                        String(now.getHours()).padStart(2, '0'),
                        String(now.getMinutes()).padStart(2, '0'),
                    ].join('');

                    const backupFile = `${file.replace(/\.json$/, '')}_${ts}.bak.json`;
                    writeJsonAtomic(backupFile, removedValues);
                    logging('info', context, `Excluded keys backed up into: ${backupFile}`);
                }

                writeJsonAtomic(file, updated);

                logging('info', context, `→ Cleaned ${file}`);
            } else {
                logging('info', context, `→ No matching keys to remove in: ${file}`);
            }
        } else {
            context.logger.warn(`→ Skipping invalid JSON (${file}): ${read.error}`);
        }
    });

    logging('success', context, '✔ Cleanup completed');
};


const findJsonFiles = (pattern: string): string[] => {
    const directory = path.dirname(pattern);

    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
        return [];
    }

    const results: string[] = [];

    Object.entries(entries).forEach(([_, entry]) => {
        if (entry.isFile() && (/^(?!.*_\d+\.bak\.json$)[^.].*\.json$/i.test(entry.name))) {
            results.push(path.join(directory, entry.name));
        }
    });

    return results;
};


const safeReadJson = (filePath: string): { ok: true; data: unknown } | { ok: false; error: string } => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content) as unknown;
        return { ok: true, data };
    } catch (err: unknown) {
        return { ok: false, error: normalizeError(err) };
    }
};

const removeByPrefixes = (data: unknown, prefixes: string[]): { updated: unknown; removedValues: Record<string, unknown> } => {
    if (!isPlainObject(data)) {
        return { updated: data, removedValues: {} };
    }

    const translations = data['translations'];

    if (!isPlainObject(translations)) {
        return { updated: data, removedValues: {} };
    }

    const startsWithAny = (k: string): boolean => prefixes.some(p => p && k.startsWith(p));

    const removedValues: Record<string, unknown> = {};
    const cleanedEntries: [string, unknown][] = [];

    Object.entries(translations).forEach(([key, value]) => {
        if (startsWithAny(key)) {
            removedValues[key] = value;
        } else {
            cleanedEntries.push([key, value]);
        }
    });

    const updated: Record<string, unknown> = { ...data, translations: Object.fromEntries(cleanedEntries) };

    return { updated, removedValues };
};


const writeJsonAtomic = (file: string, data: unknown): void => {
    const serialized = JSON.stringify(data, null, 2);
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const tmp = path.join(dir, `.${path.basename(file)}.${randomUUID()}.tmp`);
    fs.writeFileSync(tmp, serialized, 'utf8');
    fs.renameSync(tmp, file);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeError = (err: unknown): string => {
    if (err instanceof Error) {
        return err.message;
    }

    if (typeof err === 'string') {
        return err;
    }

    return 'Unknown error occurred';
};

