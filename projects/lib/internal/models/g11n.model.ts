import type { Provider } from '@angular/core';

import type { G11nOptions } from './g11n-options.model';

export interface G11n {
    options: Required<G11nOptions>;
    providers: Provider[];
}
