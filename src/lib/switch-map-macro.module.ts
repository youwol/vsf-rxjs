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
            	dt: new env.vsf.Configurations.Integer({value: 1000}),
            	take: new env.vsf.Configurations.Integer({value: 3}),
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
        mergeMap: { innerMacro: { macroTypeId: 'macro' }},
        switchMap: { innerMacro: { macroTypeId: 'macro' }},
        concatMap: { innerMacro: { macroTypeId: 'macro' }},
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
 */ import { Modules } from '@youwol/vsf-core'
import { module as baseModule } from './utils-innermap'

export function module(fwdParams: Modules.ForwardArgs) {
    return baseModule('switch', fwdParams)
}
