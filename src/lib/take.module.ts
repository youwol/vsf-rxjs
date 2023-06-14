/**
 * This module wrap the [take](https://rxjs.dev/api/operators/take) operator of [RxJs](https://rxjs.dev/).
 *
 * It takes a specified number of values emitted by an observable, then complete the observable.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')\n
    project = await project.parseDag(
 		'(timer#timer)>#c1>(take#take)>#c2>(accView#view)',
      	{
      	    take: { count: 3 },
      	    view:{
      	       containerAttributes: {style:{marginTop:'10px'}},
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
    		selector: ({uid}) => ['take'].includes(uid),
        	view: (elem) => ({innerText: "Take " + elem.configurationInstance.count})
        },
        {
    		selector: ({uid}) => ['view'].includes(uid),
        	view: (elem) => elem.html()
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
        count: new Attributes.Integer({
            value: 1,
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
