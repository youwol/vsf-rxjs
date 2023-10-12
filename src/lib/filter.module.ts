/**
 * This module wrap the [filter](https://rxjs.dev/api/operators/filter) operator of [RxJs](https://rxjs.dev/).
 *
 * It filters items emitted by the source observable based on a provided predicate function.
 * The operator only allows items that meet the condition specified by the predicate function
 * to pass through to the output observable.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample_filter" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: [ '@youwol/vsf-rxjs', '@youwol/vsf-debug'],
        workflow: {
            branches:['(timer#timer)>#c1>(filter#filter)>#c2>(console#log)'],
            configurations:{
                filter: { predicate: ({data}) => data/2 == parseInt(data/2) },
            }
        },
        views: [{
            id:'View',
            html: project.summaryHtml()
        }],
        flowchart: {
            annotations:[
                {
                    selector: ({uid}) => ['c1', 'c2'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['filter'].includes(uid),
                    html: (elem) => ({innerText: "only even" })
                }
            ]
        }
    })
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample_filter').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { filter } from 'rxjs/operators'

/**
 * ## Example
 * ```
 * {
 *     predicate: ({data}) => data % 2  // For data being a number
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * A function that evaluates each value emitted by the source Observable.
         * If it returns true, the value is emitted, if false the value is not passed to the output Observable.
         * The index parameter is the number i for the i-th source emission that has happened since the subscription,
         * starting from the number 0.
         *
         * Default to `({data}) => data != undefined`
         */
        predicate: new Configurations.JsCode({
            value: (
                message: Modules.ProcessingMessage,
                // eslint-disable-next-line unused-imports/no-unused-vars -- for documentation purpose
                index: number,
            ): boolean => message.data != undefined,
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
        filter((message, i) => {
            return message.configuration.predicate(message, i)
        }),
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
