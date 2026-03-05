
import type { JsonObject } from '@angular-devkit/core';


export interface ExtractG11nOptions extends JsonObject {
    outputPath: string;
    outFile: string;
    format: string;
    exclusionKeyPrefixes: string[];
    backUpExcludedKeys: boolean;
}
