/**
 * This module wrap the [merge](https://rxjs.dev/api/index/function/merge) function of [RxJs](https://rxjs.dev/).
 *
 * It combines multiple observables into a single observable that emits all the values from all the source observables,
 * as they are emitted.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample_merge" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        workflow: {
            branches: [
                '(timer#timer1)>>(take#take1)>#c1>0(merge#merge)>#c3>(accView#view)',
                '(timer#timer2)>>(delay#delay)>>(take#take2)>#c2>1(#merge)'
            ],
            configurations: {
                take1: { count: 3 },
                take2: { count: 4 },
                delay: { due: 500 },
                merge: { inputsCount: 2 },
                view:{
                   vDomMap: (v) => ({innerText:  v})
                },
            }
        },
        views: [{
            id: 'View',
            html: project.summaryHtml()
        }],
        flowchart: {
            annotations: [
                {
                    selector: ({uid}) => ['c1', 'c2', 'c3'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['take1', 'take2'].includes(uid),
                    html: (elem) => ({innerText: "take "+elem.configurationInstance.count })
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
 *     document.getElementById('iFrameExample_merge').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules } from '@youwol/vsf-core'
import { createVariableInputs } from './common'
import { merge } from 'rxjs'

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
        inputsCount: Modules.integerAttribute(
            { value: 2 },
            { override: 'final' },
        ),
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
    output$: merge(...Object.values(arg.inputs)),
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
