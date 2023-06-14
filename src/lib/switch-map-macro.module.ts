// noinspection JSValidateJSDoc

/**
 * This module wrap the [switchMap](https://rxjs.dev/api/operators/switchMap) operator of [RxJs](https://rxjs.dev/)
 * where the inner observables are provided using a {@link VsfCore.Projects.MacroModel} from the project.
 *
 * It transforms the items emitted by an observable into a new observable, and then flattens the resulting
 * observables (from the macro) into a single observable.
 *
 * See {@link configuration} to setup the module.
 *
 * The {@link SwitchMap} version of the module (inner observable provided as plain javascript function) is
 * also available.
 *
 * Below is an example comparing {@link MergeMapMacro}, {@link SwitchMapMacro} and {@link ConcatMapMacro}.
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
    project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')
    //-------------------------------------------------------------------
    // Define the macro that will be used by mergeMap/switchMap/concatMap
    //-------------------------------------------------------------------
    project = await project.parseDag(
 		'(timer#timer)>>(take#take)>#c>(map#map)',
      	{
        	map: {
                project:({data, scope}) => ({
                	data:{ tick: data, id: scope.uid }
            	})
            }
        },
      	'macro'
	)
    project = await project.exposeMacro('macro', {
        configuration: {
            schema:{
            	dt: new env.vsf.Attributes.Integer({value: 1000}),
            	take: new env.vsf.Attributes.Integer({value: 3}),
            }
        },
        configMapper: (config)=> ({
        	timer: { period: config.dt },
        	take:  { count: config.take }
        }),
        inputs:[],
        outputs: ['(#map)0']
	})
    //-------------------------
    // Define the main workflow
    //-------------------------
    const viewConf = {
            containerAttributes:{
            	class:'rounded',
                style: { backgroundColor: 'rgba(0,0,0,0.5)', padding:'2px' }
            },
        	vDomMap: (data, module) => ({
                innerText: JSON.stringify(data)
            }),
        }
    const connectionConfig = {
        adaptor:({data}) => ({
            data,
         	configuration:{  macroConfiguration: data },
        }),
        transmissionDelay: 500
    }
    project = await project.parseDag([
        '(from#from)>#c0>(mergeMapMacro#mergeMap)>>(accView#view0)',
        '(#from)>#c1>(switchMapMacro#switchMap)>>(accView#view1)',
        '(#from)>#c2>(concatMapMacro#concatMap)>>(accView#view2)',
    ], {
    	from: {
            input: [{dt: 2000, take: 2}, {dt: 1000, take: 2}]
        },
        mergeMap: { macroId: 'macro' },
        switchMap: { macroId: 'macro' },
        concatMap: { macroId: 'macro' },
        view0: viewConf,
        view1: viewConf,
        view2: viewConf,
        c0:connectionConfig,
        c1:connectionConfig,
        c2:connectionConfig,
    })
    //-------------------------
    // Define views
    //-------------------------
    project = project.addHtml("View", project.summaryHtml())
    project = project.addToCanvas({
    	selector: ({uid}) => ['view0', 'view1', 'view2'].includes(uid),
        view: (elem) => elem.html()
    })
    project = project.addToCanvas({
    	selector: ({uid}) => ['c0', 'c1', 'c2'].includes(uid),
        view: (c) => ({ innerText: env.fv.attr$( c.end$, ({data}) => JSON.stringify(data) )})
    })
	return project
}`
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 *
 * @module
 */
import { Modules, Immutable, Projects } from '@youwol/vsf-core'
import { finalize, map, scan, switchMap, tap } from 'rxjs/operators'
import { Observable } from 'rxjs'
import {
    configurationInnerMap,
    innerObservable,
    inputsInnerMap,
    State,
} from './utils-innermap'

export const configuration = configurationInnerMap

export const inputs = inputsInnerMap

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof configuration.schema,
        typeof inputs,
        State
    >,
): {
    // below type hints are to prevent TS errors related to depth limit of recursion
    output$: Observable<Immutable<Modules.OutputMessage<unknown>>>
    instancePool$: Observable<
        Immutable<Modules.OutputMessage<Projects.InstancePool>>
    >
} => {
    return {
        output$: arg.inputs.input$.pipe(
            tap((m) => arg.state.overallContext.info('message received', m)),
            finalize(() => arg.state.sourceObservableCompleted()),
            scan((acc, e) => {
                return [acc.slice(-1)[0], e]
            }, []),
            switchMap(([prevMessage, message]) => {
                if (prevMessage) {
                    arg.state.clearMacroInstance(prevMessage)
                }
                return innerObservable(arg.state, message)
            }),
        ),
        instancePool$: arg.state.instancePool$.pipe(
            map((pool) => ({ data: pool, context: {} })),
        ),
    }
}

export function module(fwdParams: Modules.ForwardArgs) {
    const state = new State({
        environment: fwdParams.environment,
        poolsReducer: (currentPool, newPool) => newPool,
    })
    return new Modules.Implementation(
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
