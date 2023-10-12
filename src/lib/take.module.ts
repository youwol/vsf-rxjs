/**
 * This module wrap the [take](https://rxjs.dev/api/operators/take) operator of [RxJs](https://rxjs.dev/).
 *
 * It takes a specified number of values emitted by an observable, then complete the observable.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample_take" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        workflow: {
            branches: ['(timer#timer)>#c1>(take#take)>#c2>(accView#view)'],
            configurations: {
                take: { count: 3 },
                view: {
                    containerAttributes: { class: 'd-flex flex-column', style: { marginTop:'10px' } },
                    vDomMap: (v) => ({innerText:  v})
                },
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        flowchart: {
            annotations: [
                {
                    selector: ({uid}) => ['c1', 'c2'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['take'].includes(uid),
                    html: (elem) => ({innerText: "Take " + elem.configurationInstance.count})
                },
                {
                    selector: ({uid}) => ['view'].includes(uid),
                    html: (elem) => elem.html()
                },
            ]
        }
    })
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample_take').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { take } from 'rxjs/operators'

/**
 * ## Example
 * ```
 * {
 *      count: 4
 * }
 * ```
 *
 */
export const configuration = {
    schema: {
        /**
         * The maximum number of next values to emit.
         */
        count: new Configurations.Integer({
            value: 1,
        }),
    },
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Contracts.ofUnknown,
    },
}
export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, typeof inputs>,
) => ({
    output$: arg.inputs.input$.pipe(
        // count can not be change at run-time
        take(arg.configuration.count),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}
