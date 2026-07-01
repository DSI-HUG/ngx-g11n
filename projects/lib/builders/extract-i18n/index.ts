import { type Builder, createBuilder } from '@angular-devkit/architect';
import type { JsonObject } from '@angular-devkit/core';

import { execute } from './builder';
import type { Options } from './options';
import type { Format } from './ori-schema';

const builder: Builder<Options & JsonObject> = createBuilder(execute);

export type { Format, Options };
export default builder;
