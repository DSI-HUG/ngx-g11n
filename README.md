<h1 align="center">
    @hug/ngx-g11n
</h1>

<p align="center">
    <br/>
    <a href="https://www.hug.ch">
        <img src="https://cdn.hug.ch/svgs/hug/hug-logo-horizontal.svg" alt="hug-logo" height="54px" />
    </a>
    <br/><br/>
    <i>Angular helpers for internationalizing and localizing your application</i>
    <br/><br/>
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@hug/ngx-g11n">
        <img src="https://img.shields.io/npm/v/@hug/ngx-g11n.svg?color=blue&logo=npm" alt="npm version" /></a>
    <a href="https://npmcharts.com/compare/@hug/ngx-g11n?minimal=true">
        <img src="https://img.shields.io/npm/dw/@hug/ngx-g11n.svg?color=blue&logo=npm" alt="npm donwloads" /></a>
    <a href="https://github.com/dsi-hug/ngx-g11n/blob/main/LICENSE">
        <img src="https://img.shields.io/badge/license-GPLv3-ff69b4.svg" alt="license GPLv3" /></a>
</p>

<p align="center">
    <a href="https://github.com/dsi-hug/ngx-g11n/actions/workflows/ci_tests.yml">
        <img src="https://github.com/dsi-hug/ngx-g11n/actions/workflows/ci_tests.yml/badge.svg" alt="build status" /></a>
    <a href="https://github.com/dsi-hug/ngx-g11n/blob/main/CONTRIBUTING.md#-submitting-a-pull-request-pr">
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome" /></a>
</p>

<hr/>

## Getting started

To set up or update an Angular project with this library use the Angular CLI's [schematic][schematics] commands:

#### Installation

```sh
ng add @hug/ngx-g11n
```

<details>
    <summary><i>More details</i></summary>

> <br/>
>
> The `ng add` command will ask you the following questions:
>
> 1.  **? Default language**: *the default language used by your application*
> 2.  **? Default currency**: *the default currency used by your application*
> 3.  **? Use navigator language**: *whether to use the navigator language*
> 4.  **? Use Angular locale extra**: *whether to also register Angular locale extra*
> 5.  **? Translations path**: *the path to your translation files*
> 6.  **? Query param name**: *the name of the query parameter used to define the language*
> 7.  **? Auto-inject locale in request headers**: *whether to inject the language in every requests header*
> 8.  **? Add support for Angular Material**: *whether to also configure things for Angular Material*
> 9.  **? Add locales [fr-CH, de-CH] by defaults**: *whether to add fr-CH and de-CH by default*
>
> And based on your answers, it will also potentialy perform the following actions:
>
> -   Run `ng add @angular/localize` schematic
> -   Install `@angular/material-date-fns-adapter` as a dev dependency
> -   Deploy default language files in either `/public` or `/src/assets` folder
> -   Add `skipLibCheck` in `angularCompilerOptions` of your `tsconfig.json` file (for ng14 apps)
> -   Add or modify the required configurations in your `angular.json` file:
>     ```json
>     "projects": {
>       "my-app": {
>         "i18n" {
>           "sourceLocale": "fr-CH"
>         },
>         "architect": {
>           "build": {
>             "options": {
>               "i18nMissingTranslation": "error"
>             }
>           },
>           "extract-i18n": {
>             "builder": "@angular-devkit/build-angular:extract-i18n",
>             "options": {
>               "outputPath": "projects/demo-app/public/i18n",
>               "outFile": "fr-CH.json",
>               "format": "json"
>             }
>           }
>         }
>       }
>     }
>     ```
> -   Provide and configure the library

</details>

#### Update

```sh
ng update @hug/ngx-g11n
```


## Usage

This library uses the official [@angular/localize][angular-localize-url] package under the hood, so manage your translations just as you would with it.

Then use the command `ng extract-i18n` to extract the marked messages from your components into a single source language file.

#### Examples

```html
<!-- Template content -->
<span i18n="@@demoText">Message to translate</span>
```

```html
<!-- Template attribute -->
<span subtitle="Message to translate" i18n-subtitle="@@demoText">...</span>
```

```html
<!-- Template ICU -->
<span i18n="@@demoPluralText">{items.length, plural, =0 {No item} =1 {1 item} other {{{items.length}} items}}</span>
```

```ts
// Script
const msgToTranslate = $localize`:@@demoText:Message to translate`;
```


## Helpers

The following helpers are available.

#### # currentLanguage

Get the current language of the application.

```ts
// import { currentLanguage } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { currentLanguage } from '@hug/ngx-g11n';

console.log(currentLanguage());
```

#### # setLanguage

Set a language and reload the application.

```ts
// import { setLanguage } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { setLanguage } from '@hug/ngx-g11n';

setLanguage('en-US');
```


## Options

The behavior of the library can be configured either in:

* `app.config.ts` *(if the app is a standalone Angular application)*

```ts
// import { provideG11n } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { provideG11n } from '@hug/ngx-g11n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideG11n(...features)
  ]
};
```

* `app.module.ts` *(if the app is **not** a standalone Angular application)*

```ts
// import { G11nModule } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { G11nModule } from '@hug/ngx-g11n';

@NgModule({
  imports: [
    G11nModule.forRoot(...features)
  ]
})
export class AppModule { }
```

The following features are available:

#### # withDefaultLocales

This feature will configure the library with `fr-CH` and `de-CH` as the default locales.

If you are not using [Angular Material][angular-material-url] or prefer to use any other locale, please refer to the `withLocales` feature.

```ts
import { withDefaultLocales } from '@hug/ngx-g11n/locales';

provideG11n(withDefaultLocales())
```

#### # withLocales

This feature will configure the library with the given locales.

The `extra` and `datefns` are optionals and based on your personal requirements.

```ts
// import { withLocales } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { withLocales } from '@hug/ngx-g11n';

provideG11n(withLocales({
  'fr-CH': {
    base: () => import('@angular/common/locales/fr-CH'),
    extra: () => import('@angular/common/locales/extra/fr-CH'),
    datefns: () => import('date-fns/locale/fr-CH')
  }
}))
```

#### # withDateFnsMaterial

This feature will configure the library with everything that's required for [Angular Material][angular-material-url].

As the name suggests, it will also use the [datefns][datefns-url] adapter.

```ts
import { withDateFnsMaterial } from '@hug/ngx-g11n/material';

provideG11n(withDateFnsMaterial())
```

#### # withInterceptor

This feature will configure the library with an http interceptor.

`Accept-Language: xyz` will be added to the header of every http requests.

```ts
// import { withInterceptor } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { withInterceptor } from '@hug/ngx-g11n';

provideG11n(withInterceptor())
```

#### # withOptions

This feature will override the defaults library options.

```ts
// import { withOptions } from '@hug/ngx-g11n/legacy'; /* for ng14 apps */
import { withOptions } from '@hug/ngx-g11n';

interface G11nOptions {
    /** @default 'fr-CH' */
    defaultLanguage?: string;
    /** @default 'CHF' */
    defaultCurrency?: string;
    /** @default true */
    useNavigatorLanguage?: boolean;
    /** @default false */
    loadLocaleExtra?: boolean;
    /** @default true */
    useTranslations?: boolean;
    /** @default '/translations' */
    translationsPath?: string;
    /** @default 'lang' */
    queryParamName?: string;
    /** @default localStorage */
    storage?: Storage;
    /** @default NO_DEBUG */
    debug?: G11nDebug;
}

provideG11n(withOptions(options))
```


## Debug

The following modes are available:

#### # SHOW_KEYS

Will display each translation key next to its translation *(ex: "message (@key)")*.

Useful when you need to quickly and easily retrieve the associated key of a message.

> Use `withOptions({ debug: G11nDebug.SHOW_KEYS }))` or the query parameter *(ex: `?lang=keys`)*.

#### # DUMMY_TRANSLATIONS

Will replace every translation with a dash (`-`).

Useful when you need to see what messages are left untranslated.

> Use `withOptions({ debug: G11nDebug.DUMMY_TRANSLATIONS }))` or the query parameter *(ex: `?lang=dummy`)*.

#### # NO_DEBUG

Disable any debug mode.

> Use `withOptions({ debug: G11nDebug.NO_DEBUG })`.


## Development

See the [developer docs][developer].


## Contributing

#### > Want to Help?

Want to file a bug, contribute some code or improve documentation? Excellent!

But please read up first on the guidelines for [contributing][contributing], and learn about submission process, coding rules and more.

#### > Code of Conduct

Please read and follow the [Code of Conduct][codeofconduct], and help us keep this project open and inclusive.


## Credits

Copyright (C) 2025 [HUG - Hôpitaux Universitaires Genève][dsi-hug]

[![love@hug](https://img.shields.io/badge/@hug-%E2%9D%A4%EF%B8%8Flove-magenta)][dsi-hug]




[schematics]: https://angular.io/guide/schematics-for-libraries
[angular-localize-url]: https://angular.dev/guide/i18n#learn-about-angular-internationalization
[angular-material-url]: https://material.angular.io
[datefns-url]: https://material.angular.io/components/datepicker/overview#choosing-a-date-implementation-and-date-format-settings
[developer]: https://github.com/dsi-hug/ngx-sentry/blob/main/DEVELOPER.md
[contributing]: https://github.com/dsi-hug/ngx-sentry/blob/main/CONTRIBUTING.md
[codeofconduct]: https://github.com/dsi-hug/ngx-sentry/blob/main/CODE_OF_CONDUCT.md
[dsi-hug]: https://github.com/dsi-hug
