/**
 * This module wrap the [scan](https://rxjs.dev/api/index/function/scan) operator of [RxJs](https://rxjs.dev/).
 *
 * It applies an accumulation function to the values emitted by an observable and emits each
 * intermediate result as they are computed.
 * It's like {@link reduce}, but emits the current accumulation state after each update.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample_scan" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        workflow: {
            branches: ['(timer#timer)>>(take#take)>#c1>(scan#scan)>#c2>(view#view)'],
            configurations: {
                take: { count: 4 },
                scan: { accumulator: (acc, {data}) => acc + data, seed: 0 },
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
                    selector: ({uid}) => ['scan'].includes(uid),
                    html: (elem) => ({innerText: "(acc, e) => acc + e"})
                },
            ]
        }
    })
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample_scan').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Contracts } from '@youwol/vsf-core'
import { map, scan } from 'rxjs/operators'

/**
 * ## Example
 *
 * ```
 * {
 *      accumulator: (acc, {data}) => acc + data,
 *      seed: () => 0
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * A "reducer function". This will be called for each value after an initial state is acquired.
         *
         * Default to `(acc, {data}) => Array.isArray(acc) ? [...acc, data] : [data]`
         */
        accumulator: Modules.jsCodeAttribute(
            {
                value: <V, A>(
                    acc: A,
                    message: Modules.ProcessingMessage<V>,
                ): A => {
                    return Array.isArray(acc)
                        ? ([...acc, message.data] as unknown as A)
                        : ([message.data] as unknown as A)
                },
            },
            { override: 'final' },
        ),
        /**
         * The initial state.
         *
         * Default to `[]`.
         */
        seed: Modules.anyAttribute({ value: [] }, { override: 'final' }),
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
        scan((acc, message) => {
            return arg.configuration.accumulator(acc, message)
        }, arg.configuration.seed),
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
