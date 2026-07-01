/**
 * Usage: $ node ./make.mjs <watch|build|build-global>
 */

import { watch as chokidarWatch } from 'chokidar';
import cpy from 'cpy';
import crossSpawn from 'cross-spawn';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';

const { sync: spawnSync } = crossSpawn;
const __dirname = dirname(fileURLToPath(import.meta.url));

const NG_PROJECT_LIBRARY_NAME = 'lib';
const LIBRARY_SRC = '.';
const BUILDERS_SRC = 'builders';
const SCHEMATICS_SRC = 'schematics';
const LIBRARY_TYPE = existsSync(pathResolve(__dirname, 'ng-package.json')) ? 'ng' : 'ts'; // 'ng' or 'ts'
const LIBRARY_SRC_PATH = pathResolve(__dirname, LIBRARY_SRC);
const BUILDERS_SRC_PATH = pathResolve(__dirname, BUILDERS_SRC);
const SCHEMATICS_SRC_PATH = pathResolve(__dirname, SCHEMATICS_SRC);
const WORKSPACE_PATH = pathResolve(__dirname, '..', '..');
const DIST_PATH = pathResolve(WORKSPACE_PATH, 'dist/ngx-g11n');

const copyAssets = async () => {
    await cpy(`${WORKSPACE_PATH}/README.md`, DIST_PATH, { flat: true });
    await cpy(`${WORKSPACE_PATH}/LICENSE`, DIST_PATH, { flat: true });
    if (existsSync(pathResolve(__dirname, 'bin'))) {
        await cpy(pathResolve(__dirname, 'bin'), `${DIST_PATH}/bin`, { flat: true });
    }
    if (existsSync(pathResolve(__dirname, 'scripts'))) {
        await cpy(pathResolve(__dirname, 'scripts'), `${DIST_PATH}/scripts`, { flat: true });
    }
};
const copyBuildersAssets = async () => {
    await cpy(`${BUILDERS_SRC_PATH}/*/schema.json`, `${DIST_PATH}/builders`);
    await cpy(`${BUILDERS_SRC_PATH}/builders.json`, `${DIST_PATH}/builders`, { flat: true });
    await cpy(`${BUILDERS_SRC_PATH}/package.json`, `${DIST_PATH}/builders`, { flat: true });
};
const copySchematicsAssets = async () => {
    await cpy(`${SCHEMATICS_SRC_PATH}/*/files/**/*`, `${DIST_PATH}/schematics`, { dot: true });
    await cpy(`${SCHEMATICS_SRC_PATH}/*/*.json`, `${DIST_PATH}/schematics`);
    await cpy(`${SCHEMATICS_SRC_PATH}/*/schema.json`, `${DIST_PATH}/schematics`);
    await cpy(`${SCHEMATICS_SRC_PATH}/collection.json`, `${DIST_PATH}/schematics`, { flat: true });
    await cpy(`${SCHEMATICS_SRC_PATH}/package.json`, `${DIST_PATH}/schematics`, { flat: true });
};

let chokidarWatcher;

const log = str => console.log(styleText('magenta', str));
const logHeader = str => {
    console.log(styleText('green', `\n${'-'.repeat(78)}`));
    console.log(styleText('green', str));
    console.log(styleText('green', `${'-'.repeat(78)}`));
};

const spawnCmd = (cmd, args, verbose = true, exitOnError = true) => {
    const ret = spawnSync(cmd, args, {
        stdio: verbose ? 'inherit' : 'pipe',
    });
    if (exitOnError && ret.status !== 0) {
        process.exit(1);
    }
};

const cleanDir = (path, removeFolder = false) =>
    new Promise(resolve => {
        const exists = existsSync(path);
        if (exists) {
            rmSync(path, { recursive: true });
        }
        if (!removeFolder) {
            // Give time to rmSync to unlock the file on Windows
            setTimeout(
                () => {
                    mkdirSync(path, { recursive: true });
                    resolve();
                },
                exists ? 1000 : 0,
            );
        } else {
            resolve();
        }
    });

const cleanUp = async () => {
    if (chokidarWatcher) {
        await chokidarWatcher.close();
    }
};

const registerExitEvents = () => {
    // catches exit
    process.on('exit', cleanUp);

    // catches ctrl+c
    process.on('SIGINT', cleanUp);

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', cleanUp);
    process.on('SIGUSR2', cleanUp);

    // catches uncaught exceptions
    process.on('uncaughtException', cleanUp);
};

const packDistAndInstallGlobally = async () => {
    log('> Packing..');
    spawnCmd('npm', ['pack', DIST_PATH, '--pack-destination', DIST_PATH]);

    log('> Installing globally..');
    const distPkgJson = JSON.parse(readFileSync(`${DIST_PATH}/package.json`));
    const libName = distPkgJson.name.replace('@', '').replace('/', '-');
    const filePath = `${DIST_PATH}/${libName}-${distPkgJson.version}.tgz`;
    spawnCmd('npm', ['install', '--global', filePath]);
    rmSync(filePath);
};

const buildSchematics = async (exitOnError = true) => {
    if (existsSync(SCHEMATICS_SRC_PATH)) {
        if (existsSync('./schematics/tsconfig.schematics.json')) {
            log('> Building schematics..');
            spawnCmd('tsc', ['-p', './schematics/tsconfig.schematics.prod.json'], true, exitOnError);
        }
        log('> Copying schematics assets..');
        await copySchematicsAssets();
    }
};

const buildBuilders = async (exitOnError = true) => {
    if (existsSync(BUILDERS_SRC_PATH)) {
        if (existsSync('./builders/tsconfig.builders.json')) {
            log('> Building builders..');
            spawnCmd('tsc', ['-p', './builders/tsconfig.builders.prod.json'], true, exitOnError);
        }
        log('> Copying builders assets..');
        await copyBuildersAssets();
    }
};

const buildLib = async (exitOnError = true) => {
    if (existsSync(LIBRARY_SRC_PATH)) {
        log('> Building library..');
        if (LIBRARY_TYPE === 'ng') {
            spawnCmd('ng', ['build', NG_PROJECT_LIBRARY_NAME, '--configuration', 'production'], true, exitOnError);
        } else {
            spawnCmd('tsc', ['-p', './tsconfig.lib.prod.json'], true, exitOnError);
        }
    }

    log('> Copying assets..');
    await copyAssets();
};

const watch = async () => {
    const rebuild = async () => {
        logHeader('Rebuilding...');
        await cleanDir(DIST_PATH);
        await buildLib(false);
        await buildSchematics(false);
        log(`> ${styleText('green', 'Done!')}`);
    };

    chokidarWatcher = chokidarWatch([LIBRARY_SRC_PATH, SCHEMATICS_SRC_PATH], { ignoreInitial: true, usePolling: true });
    chokidarWatcher.on('ready', rebuild);
    chokidarWatcher.on('add', rebuild);
    chokidarWatcher.on('change', rebuild);
    chokidarWatcher.on('unlink', rebuild);
};

(async () => {
    try {
        switch (process.argv[2]) {
            case 'watch':
                registerExitEvents();
                await watch();
                break;
            case 'build':
                log('> Cleaning..');
                await cleanDir(DIST_PATH);
                await buildLib();
                await buildSchematics();
                await buildBuilders();
                log(`> ${styleText('green', 'Done!')}\n`);
                break;
            case 'build-global':
                log('> Cleaning..');
                await cleanDir(DIST_PATH);
                await buildLib();
                await buildSchematics();
                await buildBuilders();
                await packDistAndInstallGlobally();
                log(`> ${styleText('green', 'Done!')}\n`);
                break;
            default:
                break;
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
