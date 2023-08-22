// noinspection JSValidateJSDoc

/**
 * This module wrap the [delay](https://rxjs.dev/api/operators/delay) operator of [RxJs](https://rxjs.dev/).
 *
 * It delays the emissions of items from the source observable by a specified amount of time,
 * and then emits them to the subscribers of the output observable.
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
 		'(timer#timer)>#c1>(delay#delay)>#c2>(console#log)',
      	{
            delay: { due: 500 },
        },
    )
    project = project.addHtml("View", project.summaryHtml())
    project = project.addToCanvas(
    	{
    		selector: ({uid}) => ['c1', 'c2'].includes(uid),
        	view: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
    	},
    	{
    		selector: ({uid}) => ['delay'].includes(uid),
        	view: (elem) => ({innerText: "delay " + elem.configurationInstance.due+ " ms" })
    	}
    )
	return project
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { delay } from 'rxjs/operators'

/**
 * ## Example
 * ```
 * {
 *     due: 1000 // i.e. 1 second
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * The delay duration in milliseconds until which the emission of the source items is delayed.
         *
         * Default to `0`.
         */
        due: new Configurations.Float({
            value: 0,
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
    output$: arg.inputs.input$.pipe(delay(arg.configuration.due)),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            outputs,
            inputs,
        },
        fwdParams,
    )
}
