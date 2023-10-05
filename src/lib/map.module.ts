/**
 * This module wrap the [map](https://rxjs.dev/api/operators/map) operator of [RxJs](https://rxjs.dev/).
 *
 * It transforms the values emitted by an observable into new values, based on a transformation
 * function provided as an argument. The transformed values are emitted by the output observable.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-debug'],
        flowchart: {
            branches: ['(timer#timer)>#c1>(map#map)>#c2>(console#log)'],
            configurations: {
                map: { project: ({data, context}) => ({data:data*10, context}) },
            }
        },
        views: [{
            id: 'View',
            html: project.summaryHtml()
        }],
        canvas: {
            annotations: [
                {
                    selector: ({uid}) => ['c1', 'c2'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['map'].includes(uid),
                    html: (elem) => ({innerText: 'times 10' })
                }
            ]
        }
    })
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { map } from 'rxjs/operators'

/**
 * ## Example
 *
 * ```
 * {
 *     project: ({data}) => data * 10
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * The function to apply to each value emitted by the source Observable.
         * The index parameter is the number i for the i-th emission that has happened since the subscription, starting from the number 0.
         *
         * Default to `(message) => message`.
         */
        project: new Configurations.JsCode({
            value: (
                message: Modules.ProcessingMessage,
                // eslint-disable-next-line unused-imports/no-unused-vars -- for documentation purposes
                index,
            ): Modules.OutputMessage<unknown> => message,
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
        map((message, i) => {
            return message.configuration.project(message, i)
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
