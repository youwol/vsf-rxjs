// noinspection JSValidateJSDoc

/**
 * This module wrap the [from](https://rxjs.dev/api/operators/filter) function of [RxJs](https://rxjs.dev/).
 *
 * It creates an observable from an array, an iterable object, a promise, or any object that
 * has a Symbol.iterator method.
 * The created observable emits each item from the input data source in sequence and then completes.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 * Note that the delay between emission from the module `from` is added only for illustrating purposes
 * (through the `transmissionDelay` property).
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')\n
    project = await project.parseDag(
       '(from#from)>#c>(accView#view)'
        ,
        {   from: { input: ['foo', 'bar', 'baz', 'qux'] },
            c: { transmissionDelay: 1000 },
            view:{
               vDomMap: (v) => ({innerText:  v})
           },
      },
    )
    project = project.addHtml("View", project.summaryHtml())
    project = project.addToCanvas(
      {
          selector: ({uid}) => ['c'].includes(uid),
          view: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
      },
      {
           selector: ({uid}) => ['view'].includes(uid),
           view: (elem) => elem.html()
      },
      {
           selector: ({uid}) => ['from'].includes(uid),
           view: (elem) => ({innerText: "'foo', 'bar', 'baz', 'qux'"})
      },
    )
    return project
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations } from '@youwol/vsf-core'
import { from, ObservableInput } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * ## Examples
 *
 * ### From an array
 * ```
 * {
 *     input: [10, 20, 30]
 * }
 * ```
 *
 * ### From a generator
 * ```
 * {
 *     input: () => {
 *          let i = seed;
 *          while (true) {
 *               yield i;
 *               i = 2 * i;
 *          }
 *     }
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * The input value, can be anything that can be converted to an observable.
         * See [ObservableInput](https://rxjs.dev/api/index/type-alias/ObservableInput).
         *
         * Default to `[{}]`
         */
        input: new Configurations.CustomAttribute<ObservableInput<unknown>>({
            value: [{}],
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, never>,
) => ({
    output$: from(arg.configuration.input as ObservableInput<unknown>).pipe(
        map((data) => ({ data, context: {} })),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            outputs,
        },
        fwdParams,
    )
}
