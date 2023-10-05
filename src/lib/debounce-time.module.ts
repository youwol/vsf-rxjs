// noinspection JSValidateJSDoc

/**
 * This module wrap the [debounceTime](https://rxjs.dev/api/operators/debounceTime) operator of [RxJs](https://rxjs.dev/).
 *
 * It delays the emissions of items from the source observable by a specified amount of time,
 * and then only emits the latest item from the source observable during that time interval.
 * If the source observable emits multiple items within the specified time interval,
 * the operator discards all but the latest item.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 * New emissions can be triggered by moving the mouse within the area with white borders in the `DAG` panel.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    const { ReplaySubject } =  env.rxjs \n
    class State{
    	constructor(){ this.output$ = new ReplaySubject(1) }
        set(v) { this.output$.next({data:v}) }
    } \n
    return await project.with({
        toolboxes:['@youwol/vsf-rxjs', '@youwol/vsf-flux-view', '@youwol/vsf-debug'],
        flowchart:{
            branches:['(of#of)>>(view#input)>#c1>(debounceTime#debounce)>#c2>(console#log)'],
            configurations:{
                debounce: { dueTime: 500 },
                input: {
                    state: new State(),
                    outputs: (state) => ({
                        output: state.output$
                    }),
                    vDomMap: (data, mdle) => ({
                        style:{
                            marginTop:'15px'
                        },
                        children: [
                            { innerText: "Move mouse below"},
                            {
                                class:'border mx-auto',
                                style:{width: '20px', height:'15px'},
                                onmousemove: (ev) => mdle.state.set([ev.clientX, ev.clientY])
                            }
                        ]
                    })
                }
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        canvas:{
            annotations:[
                {
                    selector: ({uid}) => ['input'].includes(uid),
                    html: (elem) => elem.html()
                },
                {
                    selector: ({uid}) => ['debounce'].includes(uid),
                    html: (elem) => ({innerText: elem.configurationInstance.dueTime + ' ms'})
                },
                {
                    selector: ({uid}) => ['c1', 'c2'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
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
import { debounceTime } from 'rxjs/operators'

/**
 * ## Example
 * ```
 * {
 *     dueTime: 1000 // i.e. 1 second
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * Timeout duration in milliseconds.
         *
         * Default to `0`.
         */
        dueTime: new Configurations.Float({
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
    output$: arg.inputs.input$.pipe(debounceTime(arg.configuration.dueTime)),
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
