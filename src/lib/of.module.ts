/**
 * This module wrap the [of](https://rxjs.dev/api/index/function/of) function of [RxJs](https://rxjs.dev/).
 *
 * It creates an observable that emits a fixed set of values in sequence, and then completes.
 *
 * See {@link configuration} to setup the module.
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *    const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        flowchart: {
            branches: ['(of#of)>#c>(accView#view)'],
            configurations: {
                of: { args: [1, 2, 3] , spread: true},
                view: {
                    containerAttributes: { class:'d-flex flex-column rounded p-1 border', style:{marginTop:'15px'}},
                    vDomMap: (data) => ({ innerText: 'received: '+ data })
                },
                c: { transmissionDelay: 500 }
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        canvas: {
            annotations: [
                {
                    selector: ({uid}) => uid == 'view',
                    html: (elem) => elem.html()
                },
                {
                    selector: ({uid}) => uid == 'of',
                    html: () => ({innerText:'1, 2, 3'})
                },
                {
                    selector: (elem) => elem.uid == 'c',
                    html: (c) => ({ innerText: env.fv.attr$( c.end$, ({data}) =>  data ) })
                }
            ]
        }
    })
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
