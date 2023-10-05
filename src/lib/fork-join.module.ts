/**
 * This module wrap the [filter](https://rxjs.dev/api/operators/filter) operator of [RxJs](https://rxjs.dev/).
 *
 * It waits for several observables to complete and then combines their last emitted values
 * into an array, which is emitted by the output observable.
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
            branches: [
                '(timer#timer1)>>(take#take1)>#c1>0(forkJoin#fork)>#c3>(console#log)',
                '(timer#timer2)>>(take#take2)>#c2>1(#fork)'
            ],
            configurations: {
                take1: { count: 3 },
                take2: { count: 4 },
                fork: { inputsCount: 2 }
            }
        },
        views: [{
            id: 'View',
            html: project.summaryHtml()
        }],
        canvas: {
            annotations: [
                {
                    selector: ({uid}) => ['c1', 'c2', 'c3'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['take1', 'take2'].includes(uid),
                    html: (elem) => ({innerText: 'Take first '+elem.configurationInstance.count+' items' })
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
import { Modules, Configurations } from '@youwol/vsf-core'
import { createVariableInputs } from './common'
import { forkJoin } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * ## Example
 * ```
 * {
 *     inputsCount: 2
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * Number of inputs.
         *
         * Default to `2`.
         */
        inputsCount: new Configurations.Integer({
            value: 2,
        }),
    },
}

export const inputs = (fwdParameters) =>
    createVariableInputs(fwdParameters.configurationInstance)

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof configuration.schema,
        ReturnType<typeof inputs>
    >,
) => ({
    output$: forkJoin(...Object.values(arg.inputs)).pipe(
        map((messages) => {
            return {
                data: messages.map((m) => m.data),
                context: Modules.mergeMessagesContext(
                    ...messages.map((m) => m.context),
                ),
            }
        }),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            inputs: inputs(fwdParams),
            outputs,
        },
        fwdParams,
    )
}
