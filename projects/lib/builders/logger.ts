import type { BuilderContext } from '@angular-devkit/architect';

const reset = '\x1b[0m';

const colors = {
    green: (msg: string): string => `\x1b[32m${msg}${reset}`,
    red: (msg: string): string => `\x1b[31m${msg}${reset}`,
    blue: (msg: string): string => `\x1b[34m${msg}${reset}`,
    yan: (msg: string): string => `\x1b[36m${msg}${reset}`,
};

type LogType = 'info' | 'success' | 'error' | 'step' | 'debug';

const logSuccess = (context: BuilderContext, message: string, breakLine = true): void => {
    log(context, colors.green(message), breakLine);
};

const logError = (context: BuilderContext, message: string): void => {
    context.logger.error(colors.red(message));
};

const logStep = (context: BuilderContext, message: string, breakLine = false): void => {
    log(context, colors.blue(message), breakLine);
};

const logDebug = (context: BuilderContext, message: string, breakLine = false): void => {
    log(context, colors.yan(message), breakLine);
};

const log = (context: BuilderContext, message: string, breakLine = false): void => {
    context.logger.info(message);
    if (breakLine) {
        context.logger.info('');
    }
};

const logging = (type: LogType, context: BuilderContext, message: string, breakLine?: boolean): void => {
    switch (type) {
        case 'success':
            logSuccess(context, message, breakLine);
            break;
        case 'error':
            logError(context, message);
            break;
        case 'step':
            logStep(context, message, breakLine);
            break;
        case 'debug':
            logDebug(context, message, breakLine);
            break;
        default:
            log(context, message, breakLine);
    }
};

export default logging;
