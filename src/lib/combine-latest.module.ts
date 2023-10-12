// noinspection JSValidateJSDoc

/**
 * This module wrap the [combineLatest](https://rxjs.dev/api/operators/combineLatest) operator of [RxJs](https://rxjs.dev/).
 *
 * It takes two or more observables as inputs and returns a new observable that emits
 * an array of the latest values emitted by each input observable.
 * Whenever any of the input observables emit a new value,
 * the output observable emits a new array with the latest values from all the input observables.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 * New emission can be triggered by clicking on the labels `red`, `green`, `blue`, `square`, `circle` in the
 * DAG (or View) panels.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
   const { ReplaySubject, operators } =  env.rxjs
   const { attr$ } =  globalThis['@youwol/flux-view']
   class State{
       constructor(){ this.output$ = new ReplaySubject(1) }
       set(v) { this.output$.next({data:v}) }
   }
   const vDom = (items) => ({
       state: new State(),
       outputs: (state) => ({
           output: state.output$.pipe( operators.distinctUntilChanged( (a,b) => a.data == b.data ) )
       }),
       vDomMap: (data, mdle) => {
           mdle.state.set(data)
           return {
               style:{marginTop:'10px'},
               children: [
                   { innerHTML: '<b>Click on item:</b>', class:'fv-text-focus'},
                   {
                       class:'d-flex align-items-center',
                       children: items.map( c=> ({
                           class: attr$(
                               mdle.state.output$,
                               ({data}) => 'mr-1 fv-pointer fv-hover-text-secondary ' + (c == data ? 'fv-text-focus' : '')
                           ),
                           innerText: c,
                           onclick: () => mdle.state.set(c)
                       }))
                   }
               ]
       }}
   })
   return await project.with({
        toolboxes:['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        workflow:{
            branches: [
                '(of#of1)>>(view#input1)>#c1>0(combineLatest#combine)>#c>(accView#output)',
                '(of#of2)>>(view#input2)>#c2>1(#combine)'],
            configurations: {
                combine: {inputsCount:2},
                of1: { args: 'red' },
                input1: vDom(['red', 'green', 'blue']),
                of2: { args: 'square' },
                input2: vDom(['square', 'circle']),
                output:{ vDomMap: (data) => ({ innerText:  data }) }
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        flowchart:{
            annotations:[
                 {
                     selector: ({uid}) => ['input1','input2', 'output'].includes(uid),
                     html: (elem) => elem.html()
                 },
                 {
                     selector: ({uid}) => ['c', 'c1', 'c2'].includes(uid),
                     html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                 },
                 {
                     selector: ({uid}) => ['of1', 'of2'].includes(uid),
                     html: (elem) => ({innerText: elem.configurationInstance.args })
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
import { Modules, Configurations } from '@youwol/vsf-core'
import { map } from 'rxjs/operators'
import { createVariableInputs } from './common'
import { combineLatest } from 'rxjs'

/**
 * ## Example
 *
 * ```
 * {
 *     inputsCount: 3
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * Number of inputs of the module.
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
    output$: combineLatest(Object.values(arg.inputs)).pipe(
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
