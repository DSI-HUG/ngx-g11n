import type { Version } from '@angular/core';
import { chain, noop, type Rule, type SchematicContext, type Tree } from '@angular-devkit/schematics';
import {
    addAngularJsonAsset,
    addImportToFile,
    addImportToNgModule,
    addPackageJsonDependencies,
    addProviderToBootstrapApplication,
    application,
    type ChainableApplicationContext,
    deployFiles,
    getAngularVersion,
    logError,
    modifyJsonFile,
    packageInstallTask,
    removeFromJsonFile,
    replaceInFile,
    runAtEnd,
    schematic,
    workspace,
} from '@hug/ngx-schematics-utilities';
import { join } from 'node:path';
import { styleText } from 'node:util';

import type { NgAddOptions } from './ng-add-options';

interface G11nOptions {
    defaultLanguage?: string;
    defaultCurrency?: string;
    useNavigatorLanguage?: boolean;
    loadLocaleExtra?: boolean;
    translationsPath?: string | string[];
    queryParamName?: string;
}

export const DEFAULT_OPTIONS: G11nOptions = {
    defaultLanguage: 'fr-CH',
    defaultCurrency: 'CHF',
    useNavigatorLanguage: true,
    loadLocaleExtra: false,
    translationsPath: '/translations',
    queryParamName: 'lang',
};

const customizeProject = ({ project, tree }: ChainableApplicationContext, options: NgAddOptions, ngVersion: Version): Rule => {
    const rules: Rule[] = [];

    // tsconfig.json
    if (Number(ngVersion.major) <= 14) {
        rules.push(modifyJsonFile('tsconfig.json', ['angularCompilerOptions', 'skipLibCheck'], true));
    }

    // package.json
    // Remove if exists i18n script
    rules.push(removeFromJsonFile('package.json', ['scripts', 'i18n']));
    rules.push(modifyJsonFile('package.json', ['scripts', 'g11n'], `ng run ${project.name}:extract-g11n`));

    // angular.json
    // Remove if exists extract-i18n builder
    const extractI18nBuilderPath = ['projects', project.name, 'architect', 'extract-i18n'];
    rules.push(removeFromJsonFile('angular.json', [...extractI18nBuilderPath]));

    // Add extract-g11n builder
    const extractG11nPath = ['projects', project.name, 'architect', 'extract-g11n'];
    if (project.assetsPath) {
        rules.push(modifyJsonFile(
            'angular.json',
            [...extractG11nPath, 'options', 'outputPath'],
            join(project.assetsPath, options.translationsPath),
            () => 0),
        );
    }
    rules.push(modifyJsonFile('angular.json', [...extractG11nPath, 'options', 'outFile'], `${options.defaultLanguage}.json`, () => 1));
    rules.push(modifyJsonFile('angular.json', [...extractG11nPath, 'options', 'format'], 'json', () => 2));
    rules.push(modifyJsonFile('angular.json', [...extractG11nPath, 'options', 'exclusionKeyPrefixes'], ['_'], () => 3));

    rules.push(modifyJsonFile('angular.json', [...extractG11nPath, 'builder'], '@hug/ngx-g11n:extract-g11n', () => 0));

    rules.push(
        modifyJsonFile('angular.json', ['projects', project.name, 'i18n', 'sourceLocale'], options.defaultLanguage),
    );

    // Add assets if multiple translation file
    const additionalPaths: string[] = (typeof options.additionalPaths === 'string') ? options.additionalPaths.split(',').map(p => p.trim()).filter(Boolean) : [];
    const additionalPathsOutput: string[] = [];
    if (additionalPaths.length) {
        Object.entries(additionalPaths).forEach(([_, filePath]) => {
            const moduleName = (/^.+\/([\w-]+)\/translations$/.exec(filePath))?.[1] ?? '';

            if (moduleName.length) {
                const moduleTranslationAssets: Record<string, string> = {
                    'glob': '**/*',
                    'input': filePath,
                    'output': `assets/translations/${moduleName}`,
                };
                rules.push(addAngularJsonAsset(moduleTranslationAssets, project.name));
                additionalPathsOutput.push(`assets/translations/${moduleName}`);
            }
        });
    }

    // Provide library
    let configFile: string | null;
    if (project.isStandalone) {
        configFile = project.mainConfigFilePath;
    } else if (tree.exists(project.pathFromSourceRoot('app/app-module.ts'))) {
        configFile = project.pathFromSourceRoot('app/app-module.ts'); // for Angular 20+
    } else {
        configFile = project.pathFromSourceRoot('app/app.module.ts'); // for Angular < 20
    }

    if (configFile && tree.exists(configFile)) {
        const libName = Number(ngVersion.major) >= 15 ? '@hug/ngx-g11n' : '@hug/ngx-g11n/legacy';
        let provider = project.isStandalone ? 'provideG11n(' : 'G11nModule.forRoot(';

        // ---- locales
        if (options.defaultLocales && options.material) {
            rules.push(addImportToFile(configFile, 'withDefaultLocales', '@hug/ngx-g11n/locales'));
            provider += '\nwithDefaultLocales()';
        } else {
            rules.push(addImportToFile(configFile, 'withLocales', libName));

            const getLocale = (locale: string): string => {
                let str = `'${locale}': {`;
                str += `\n    base: () => import('@angular/common/locales/${locale}')`;
                if (options.loadLocaleExtra) {
                    str += `,\n    extra: () => import('@angular/common/locales/extra/${locale}')`;
                }
                if (options.material) {
                    str += `,\n    datefns: () => import('date-fns/locale/${locale}')`;
                }
                str += '\n  }';
                return str;
            };
            provider += '\nwithLocales({';
            if (options.defaultLocales) {
                provider += `\n  ${getLocale('fr-CH')}`;
                provider += `,\n  ${getLocale('de-CH')}`;
            } else {
                provider += `\n  ${getLocale(options.defaultLanguage)}`;
            }
            provider += '\n})';
        }

        // ---- options
        const opts: G11nOptions = {};
        Object.entries(options).forEach(([key, value]) => {
            if (key in DEFAULT_OPTIONS && DEFAULT_OPTIONS[key as keyof G11nOptions] !== value) {
                // @ts-expect-error error expected
                opts[key] = value as G11nOptions[keyof G11nOptions];
            }
        });

        // Add translations path
        if (additionalPaths.length && additionalPathsOutput.length) {
            const translationPaths: string[] = [];
            translationPaths.push(...additionalPathsOutput);
            translationPaths.push(options.translationsPath ? options.translationsPath : DEFAULT_OPTIONS.translationsPath as string);
            opts.translationsPath = translationPaths;
        }

        if (Object.keys(opts).length) {
            rules.push(addImportToFile(configFile, 'withOptions', libName));
            provider += `,\n  withOptions(${JSON.stringify(opts, null, 4)
                .replace(/"([^"]+)":/g, '$1:')
                .replace(/"/g, '\'')})`;
        }

        // ---- material
        if (options.material) {
            rules.push(addImportToFile(configFile, 'withDateFnsMaterial', '@hug/ngx-g11n/material'));
            provider += ',\nwithDateFnsMaterial()';
        }

        // ---- interceptor
        if (options.interceptor) {
            rules.push(addImportToFile(configFile, 'withInterceptor', libName));
            provider += ',\nwithInterceptor()';
        }

        provider += '\n)';
        provider = provider.split('\n').map((line, i, arr) => `${i === 0 || i === arr.length - 1 ? '' : '  '}${line}`).join('\n');
        if (project.isStandalone) {
            rules.push(async (ruleTree: Tree, ruleContext: SchematicContext): Promise<Rule> => {
                try {
                    await addProviderToBootstrapApplication(project.mainFilePath, provider, libName)(ruleTree, ruleContext);
                    return noop();
                } catch (err: unknown) {
                    const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
                    if (errorMessage.includes('Application config is not an object literal')) {
                        const fileContent = ruleTree.read(configFile)?.toString('utf-8') ?? '';
                        const patternToReplace = /providers: \[/sm;
                        if (!(patternToReplace.exec(fileContent))) {
                            const conflictContent =
                                '\n' +
                                '<<<<<<< HEAD\n' +
                                '=======\n' +
                                '\n' +
                                '// This code was auto-generated by \'@hug/ngx-g11n\' schematic.\n' +
                                '// Unfortunately the schematic was not able to merged it with your current code.\n' +
                                '// Please resolve it manually.\n' +
                                '\n' +
                                'export const appConfig: ApplicationConfig = {\n' +
                                '  providers: [\n' +
                                `    ${provider.split('\n').join('\n    ')}\n` +
                                '  ]\n' +
                                '};\n' +
                                '\n' +
                                '>>>>>>>\n';
                            return chain([
                                replaceInFile(configFile, /$/g, conflictContent),
                                runAtEnd(logError(`There were some conflicts during the installation, please have a look at ${styleText('bold', `'${configFile}'`)} file and resolve them.`)),
                            ]);
                        } else {
                            return replaceInFile(configFile, patternToReplace, `providers: [\n    ${provider.split('\n').join('\n    ')},`);
                        }
                    } else {
                        return logError(`${errorMessage} (skipping)`);
                    }
                }
            });
        } else {
            rules.push(addImportToNgModule(configFile, provider, libName));
        }
    } else {
        const error = `Could not find application ${project.isStandalone ? 'config' : 'module'} file (skipping)`;
        rules.push(logError(error));
    }

    return chain(rules);
};

export default (options: NgAddOptions): Rule =>
    async (): Promise<Rule> => {
        const ngVersion = await getAngularVersion();
        return schematic('@hug/ngx-g11n', [
            workspace()
                .spawn('ng', ['add', '@angular/localize', '--skip-confirmation'])
                .rule(() =>
                    options.material ? chain([
                        addPackageJsonDependencies([{
                            name: '@angular/material-date-fns-adapter',
                            version: `^${ngVersion.major}.0.0`,
                        }]),
                        packageInstallTask(),
                    ]) : noop(),
                )
                .toRule(),

            application(options.project)
                .rule(({ project }) => {
                    if (!project.assetsPath) {
                        return logError('Deploying assets failed: no assets path found');
                    }
                    return deployFiles(options, './files', join(project.assetsPath, options.translationsPath));
                })
                .rule(context => customizeProject(context, options, ngVersion))
                .toRule(),
        ], options);
    };
