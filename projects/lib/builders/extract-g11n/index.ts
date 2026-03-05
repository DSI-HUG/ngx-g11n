import { createBuilder } from '@angular-devkit/architect';
import type { Builder } from '@angular-devkit/architect/src/internal';

import { execute } from './builder';
import type { ExtractG11nOptions } from './extract-g11n-options';

const createdBuilder: Builder<ExtractG11nOptions> = createBuilder<ExtractG11nOptions>(execute);

export default createdBuilder;
