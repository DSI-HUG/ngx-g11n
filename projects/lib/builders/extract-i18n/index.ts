import { createBuilder } from '@angular-devkit/architect';

import { execute } from './builder';
import type { Options } from './options';
import type { Format } from './ori-schema';

const builder = createBuilder(execute);

export type { Format, Options };
export default builder;
