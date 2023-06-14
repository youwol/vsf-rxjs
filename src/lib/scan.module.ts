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
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
   project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-debug')\n
   project = await project.parseDag(
        ['(timer#timer)>>(take#take)>#c1>(scan#scan)>#c2>(console#log)'
        ],
         {   take: { count: 4 },
             scan: { accumulator: (acc, {data}) => acc + data, seed: 0 },
             view:{
               vDomMap: (v) => ({innerText:  v})
             },
       },
   )
   project = project.addHtml("View", project.summaryHtml())
   project = project.addToCanvas(
       {
           selector: ({uid}) => ['c1', 'c2'].includes(uid),
           view: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
       },
       {
    		selector: ({uid}) => ['view'].includes(uid),
        	view: (elem) => elem.html()
       },
       {
    		selector: ({uid}) => ['take'].includes(uid),
        	view: (elem) => ({innerText: "Take " + elem.configurationInstance.count})
       },
       {
    		selector: ({uid}) => ['scan'].includes(uid),
        	view: (elem) => ({innerText: "(acc, e) => acc + e"})
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
import { Modules, Attributes } from '@youwol/vsf-core'
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
        accumulator: new Attributes.JsCode({
            value: <V, A>(acc: A, message: Modules.ProcessingMessage<V>): A => {
                return Array.isArray(acc)
                    ? ([...acc, message.data] as unknown as A)
                    : ([message.data] as unknown as A)
            },
        }),
        /**
         * The initial state.
         *
         * Default to `[]`.
         */
        seed: new Attributes.Any({
            value: [],
        }),
    },
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Modules.expect.ofUnknown,
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
