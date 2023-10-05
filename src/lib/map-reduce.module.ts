/**
 * This module performs a map-reduce operation on data presented as an array-like structure.
 * It utilizes an inner-observable to enact a transformation (mapping) on each element within the incoming array
 * and subsequently aggregates them into an output array.
 *
 * See {@link configuration} to setup the module.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *   const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        macros: [{
            typeId: 'times2Macro',
            flowchart: {
                branches: ['(map#times2)'],
                configurations: { times2: { project: ({data,context}) => ({data:2*data, context}) } },
            },
            api: {
                inputs:['0(#times2)'],
                outputs: ['(#times2)0']
            }
        }],
        flowchart: {
            branches: ['(from#from)>#c>(mapReduce#times2)>>(accView#view)'],
            configurations: {
                from: { input: [[1, 2, 3], [4, 5, 6]]},
                times2: {
                    project: (message) => ({
                        macroTypeId: 'times2Macro',
                        inputSlot:0,
                        outputSlot: 0,
                        message,
                        purgeOnDone: false
                    })
                },
                view: {
                    containerAttributes: { class:'d-flex flex-column rounded p-1 border', style:{marginTop:'15px'}},
                    vDomMap: (data) => ({ innerText: 'received: '+ data })
                },
                c: { transmissionDelay: 1000 }
            }
        },
        views: [{
            id: 'View',
            html: project.summaryHtml()
        }],
        canvas: {
            annotations: [
                {
                    selector: ({uid}) => uid == 'view',
                    html: (elem) => elem.html()
                },
                {
                    selector: ({uid}) => uid == 'from',
                    html: () => ({innerText:'[[1,2,3], [4,5,6]]'})
                },
                {
                    selector: (elem) => elem.uid == 'c',
                    html: (c) => ({ innerText: env.fv.attr$( c.end$, ({data}) =>  data ) })
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
import { Modules, Macros, Contracts, Configurations } from '@youwol/vsf-core'
import { concatMap, map, mergeMap, reduce, switchMap } from 'rxjs/operators'
import { from, Observable } from 'rxjs'
import { higherOrderConfig } from './utils-innermap'

export type MapReducePolicy = 'switch' | 'merge' | 'concat'

export const configuration = {
    schema: {
        ...higherOrderConfig.schema,
        /**
         * The outer policy used to combine the result of the reduce from incoming arrays (e.g. switch, merge, etc).
         */
        outerPolicy: new Configurations.StringLiteral<MapReducePolicy>({
            value: 'switch',
        }),
        /**
         * The inner policy used to combined= the result of the map from individual items of incoming arrays
         * (e.g. switch, merge, etc).
         */
        innerPolicy: new Configurations.StringLiteral<MapReducePolicy>({
            value: 'merge',
        }),
    },
}

const policies: Record<MapReducePolicy, typeof switchMap> = {
    switch: switchMap,
    merge: mergeMap,
    concat: concatMap,
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Contracts.of<unknown[]>({
            description: 'An array of objects',
            when: (d) => Array.isArray(d),
        }),
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof configuration.schema,
        typeof inputs,
        Macros.InnerObservablesPool
    >,
) => {
    const outerPolicy = policies[arg.configuration.outerPolicy]
    const innerPolicy = policies[arg.configuration.innerPolicy]
    return {
        output$: arg.inputs.input$.pipe(
            outerPolicy(({ data, configuration, context, scope }) => {
                return from(data).pipe(
                    map((d) => ({
                        data: d,
                        configuration,
                        context,
                        scope,
                    })),
                    innerPolicy((message) => {
                        const projected = message.configuration.project(message)
                        if (projected instanceof Observable) {
                            return projected
                        }
                        return arg.state.inner$(projected, {
                            from: 'input$',
                            to: 'output$',
                        })
                    }),
                    reduce((acc, e) => {
                        return [...acc, e.data]
                    }, []),
                    map((data) => {
                        return { data, context: {} }
                    }),
                )
            }),
        ),
        instancePool$: arg.state.instancePool$.pipe(
            map((pool) => ({ data: pool, context: {} })),
        ),
    }
}

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
