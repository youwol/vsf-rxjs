// noinspection JSValidateJSDoc

/**
 * This module wrap the [concatMap](https://rxjs.dev/api/operators/concatMap) operator of [RxJs](https://rxjs.dev/).
 *
 * It transforms the items emitted by an observable into a new observable, and then flattens the resulting
 * observables into a single observable along with `concat` policy..
 *
 * See {@link configuration} to setup the module.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *     const src = `return async ({project, cell, env}) => {
   const rxjs = project.environment.rxjs
   const ops = rxjs.operators
   return await project.with({
        toolboxes:['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        flowchart:{
            branches:[
                '(of#of1)>>(delay#delay0)>>0(merge#merge)>#c>(concatMap#concatMap)>>(accView#view)',
                '(of#of3)>>(delay#delay1)>>1(#merge)',
                '(of#of5)>>(delay#delay2)>>2(#merge)'
            ],
            configurations:{
                of1: { args: 1 },
                of3: { args: 3 },
                of5: { args: 5 },
                delay0: { due: 0 },
                delay1: { due: 3200 },
                delay2: { due: 4000 },
                merge: { inputsCount: 3},
                concatMap: { project: (message) => {
                    const base = rxjs.of(message.data)
                    return rxjs.merge(
                        base.pipe(ops.delay(0)),
                        base.pipe(ops.delay(600)),
                        base.pipe(ops.delay(1200)),
                        ).pipe(
                            ops.map((data) => ({data}) )
                        )
                    }
                },
                view:{ vDomMap: (v) => ({innerText:  v})},
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        canvas:{
            annotations:[
                {
                    selector: ({uid}) => ['c'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['view'].includes(uid),
                    html: (elem) => elem.html()
                }
            ]
        }
   })
}`
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Macros } from '@youwol/vsf-core'
import { concatMap } from 'rxjs/operators'
import {
    higherOrderConfig,
    higherOrderOutputs,
    higherOrderInputs,
} from './utils-innermap'

/**
 * see {@link HigherOrder.higherOrderConfig}.
 */
export const configuration = higherOrderConfig

export const inputs = higherOrderInputs
export const outputs =
    higherOrderOutputs<typeof configuration.schema>(concatMap)

export function module(fwdParams) {
    const state = new Macros.InnerObservablesPool({
        parentUid: fwdParams.uid,
        environment: fwdParams.environment,
    })
    return new Modules.Implementation<
        typeof configuration.schema,
        typeof inputs,
        Macros.InnerObservablesPool
    >(
        {
            configuration,
            inputs,
            outputs,
            state,
            journal: state.journal,
            instancePool: state.instancePool$,
        },
        fwdParams,
    )
}
