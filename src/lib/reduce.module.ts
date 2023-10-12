// noinspection JSValidateJSDoc

/**
 * This module wrap the [reduce](https://rxjs.dev/api/index/function/reduce) operator of [RxJs](https://rxjs.dev/).
 *
 * It applies an accumulation function to the values emitted by an observable and emits a single value
 * that represents the accumulated result.
 * It is equivalent to the last value emitted by {@link Scan}.
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
        workflow: {
            branches: ['(timer#timer)>>(take#take)>#c1>(reduce#reduce)>#c2>(console#log)'],
            configurations: {
                take: { count: 4 },
                reduce: { accumulator: (acc, {data}) => acc + data, seed: 0 },
                view:{
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
                    selector: ({uid}) => ['view'].includes(uid),
                    html: (elem) => elem.html()
                },
                {
                    selector: ({uid}) => ['take'].includes(uid),
                    html: (elem) => ({innerText: "Take " + elem.configurationInstance.count})
                },
                {
                    selector: ({uid}) => ['reduce'].includes(uid),
                    html: (elem) => ({innerText: "(acc, e) => acc + e"})
                },
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
import { map, reduce } from 'rxjs/operators'

/**
 * ## Example
 *
 * ```
 * {
 *      // `message.data` expected to be `number`
 *      accumulator: (acc, message) => acc + message.data,
 *      seed: () => 0
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * The initial accumulation value.
         *
         * Default to `[]`.
         */
        seed: new Configurations.Any({
            value: [],
        }),
        /**
         * The accumulator function called on each source value.
         *
         * Default to `(acc, {data}) => Array.isArray(acc) ? [...acc, data] : [data]`
         */
        accumulator: new Configurations.JsCode({
            value: <V, A>(acc: A, message: Modules.ProcessingMessage<V>): A => {
                return Array.isArray(acc)
                    ? ([...acc, message.data] as unknown as A)
                    : ([message.data] as unknown as A)
            },
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
        reduce(arg.configuration.accumulator, arg.configuration.seed),
        map((data) => ({ data, context: {} })),
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
