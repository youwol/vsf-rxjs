/**
 * This module wrap the [of](https://rxjs.dev/api/index/function/of) function of [RxJs](https://rxjs.dev/).
 *
 * It creates an observable that emits a fixed set of values in sequence, and then completes.
 *
 * See {@link configuration} to setup the module.
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *    const src = `return async ({project, cell, env}) => {
   project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')
   project = await project.parseDag([
       '(of#of)>#c>(accView#view)',
   ],{
       of: { args: [1, 2, 3] , spread: true},
       view: {
           containerAttributes: { class:'rounded p-1 border', style:{marginTop:'15px'}},
           vDomMap: (data) => ({ innerText: 'received: '+ data })
       },
       c: { transmissionDelay: 500 }
   })
   project = project.addHtml("View", project.summaryHtml())
   project = project.addToCanvas({
       selector: ({uid}) => uid == 'view',
       view: (elem) => elem.html()
   })
   project = project.addToCanvas({
       selector: ({uid}) => uid == 'of',
       view: () => ({innerText:'1, 2, 3'})
   })
   project = project.addToCanvas({
       selector: (elem) => elem.uid == 'c',
       view: (c) => ({ innerText: env.fv.attr$( c.end$, ({data}) =>  data ) })
   })
   return project
}`
 *    const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *    document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 *
 *
 * @module
 */
import { Modules, Configurations } from '@youwol/vsf-core'
import { of } from 'rxjs'

/**
 * ## Examples
 * ### Emit a single value:
 * ```
 * {
 *     args: 1
 * }
 * ```
 * ### Emit values sequentially:
 *```
 *{
 *   args: () => [1, 2, 3],
 *   spread: true
 *}
 *```
 */
export const configuration = {
    schema: {
        /** Argument to emit. If this argument is an array and {@link spread} is `true`, the individual value
         * of the array are emitted separately.
         *
         * Default to `{}`.
         */
        args: new Configurations.Any({
            value: {},
        }),
        /** If {@link args} is an array and this attribute is `true`, the individual value
         * of the array are emitted separately.
         *
         * Default to `false`.
         */
        spread: new Configurations.Boolean({
            value: false,
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, never>,
) => {
    const value = arg.configuration.args
    const spread = Array.isArray(value) && arg.configuration.spread
    const output$ = spread
        ? of(
              ...(value as unknown[]).map((data) => ({
                  data,
                  context: {},
              })),
          )
        : of({
              data: value,
              context: {},
          })
    return {
        output$,
    }
}

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            outputs,
        },
        fwdParams,
    )
}
