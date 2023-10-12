/**
 * This module wrap the [timer](https://rxjs.dev/api/index/function/timer) function of [RxJs](https://rxjs.dev/).
 *
 * It emits a sequence of numbers over time. We can use it to emit a value after a certain amount of time has passed.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample_timer" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-debug'],
        workflow: {
            branches: ['(timer#timer)>#c1>(console#log)'],
            configurations: {
                timer: { dueTime: 0, interval: 1000 },
            }
        },
        views:[{
            id:'View',
            html: project.summaryHtml()
        }],
        flowchart: {
            annotations: [
                {
                    selector: ({uid}) => ['c1'].includes(uid),
                    html: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
                },
                {
                    selector: ({uid}) => ['timer'].includes(uid),
                    html: (elem) => ({innerText: "Every second"})
                },
            ]
        }
    })
}
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample_timer').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations } from '@youwol/vsf-core'
import { timer } from 'rxjs'
import { map } from 'rxjs/operators'

/**
 * ## Example
 *
 * ```
 * {
 *     dueTime: 500, // 500 ms
 *     interval: 1000 // 1 second
 * }
 * ```
 *
 */
export const configuration = {
    schema: {
        /**
         * The amount of time in milliseconds to wait before emitting.
         */
        dueTime: new Configurations.Float({
            value: 0,
        }),
        /**
         * The delay between each value emitted in the interval.
         * Passing a negative number here will result in immediate completion after the first value is emitted.
         */
        interval: new Configurations.Float({
            value: 1000,
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<typeof configuration.schema, never>,
) => ({
    output$: timer(arg.configuration.dueTime, arg.configuration.interval).pipe(
        map((c) => {
            return {
                data: c,
                context: {},
            }
        }),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            outputs,
        },
        fwdParams,
    )
}
