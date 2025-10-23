import type { UnitTestTree } from '@angular-devkit/schematics/testing';
import { type ApplicationDefinition, getProjectFromWorkspace } from '@hug/ngx-schematics-utilities';

import { appTest1, appTest2, getCleanAppTree, runner } from '../schematics.spec';
import { DEFAULT_OPTIONS } from '.';
import type { NgAddOptions } from './ng-add-options';

[false, true].forEach(useStandalone => {
    [false, true].forEach(useWorkspace => {
        describe(`schematics - ng-add - (using${useStandalone ? ' standalone' : ''}${useWorkspace ? ' workspace' : ' flat'} project)`, () => {
            let defaultOptions: NgAddOptions;
            let tree: UnitTestTree;
            let nbFiles: number;
            let project: ApplicationDefinition;

            beforeEach(async () => {
                tree = await getCleanAppTree(useWorkspace, useStandalone);
                nbFiles = tree.files.length;
                defaultOptions = {
                    project: (useWorkspace) ? appTest2.name : appTest1.name,
                    ...DEFAULT_OPTIONS
                } as NgAddOptions;
                project = await getProjectFromWorkspace(tree, defaultOptions.project);
            });

            it('should run without issues', async () => {
                const test$ = runner.runSchematic('ng-add', defaultOptions, tree);
                await expectAsync(test$).toBeResolved();
                expect(tree.files.length).toEqual(nbFiles + 1);
            });

            if (useStandalone) {
                it('should update app.config.ts', async () => {
                    await runner.runSchematic('ng-add', defaultOptions, tree);
                    const content = tree.readContent(project.pathFromSourceRoot('app/app.config.ts'));
                    expect(content).toContain('import { withInterceptor, provideG11n } from \'@hug/ngx-g11n\';');
                    expect(content).toContain('import { withDefaultLocales } from \'@hug/ngx-g11n/locales\';');
                    expect(content).toContain('import { withDateFnsMaterial } from \'@hug/ngx-g11n/material\';');
                    expect(content).toMatch(/provideG11n\(\n.*withDefaultLocales\(\),\n.*withDateFnsMaterial\(\),\n.*withInterceptor\(\)\n.*\)/gm);
                });
            } else {
                it('should update app-module.ts', async () => {
                    await runner.runSchematic('ng-add', defaultOptions, tree);
                    const content = tree.readContent(project.pathFromSourceRoot('app/app-module.ts'));
                    expect(content).toContain('import { withInterceptor, G11nModule } from \'@hug/ngx-g11n\';');
                    expect(content).toContain('import { withDefaultLocales } from \'@hug/ngx-g11n/locales\';');
                    expect(content).toContain('import { withDateFnsMaterial } from \'@hug/ngx-g11n/material\';');
                    expect(content).toMatch(/G11nModule\.forRoot\(\n.*withDefaultLocales\(\),\n.*withDateFnsMaterial\(\),\n.*withInterceptor\(\)\n.*\)/gm);
                });
            }
        });
    });
});
