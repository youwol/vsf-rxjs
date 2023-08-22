// noinspection JSValidateJSDoc

/**
 * This module wrap the [mergeMap](https://rxjs.dev/api/operators/mergeMap) operator of [RxJs](https://rxjs.dev/).
 *
 * It transforms the items emitted by an observable into a new observable, and then flattens the resulting
 * observables into a single observable.
 *
 * See {@link configuration} to setup the module.
 *
 * The {@link MergeMapMacro} version of the module (inner observable provided as a project's
 * {@link VsfCore.Projects.MacroModel}) is also available.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *     const src = `return async ({project, cell, env}) => {
    project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')
    const { from, operators } =  env.rxjs
    project = await project.parseDag(
 		'(of#of)>>(mergeMap#mergeMap)>#c>(accView#view)',
      	{
            of: {
            	args: 3
            },
        	mergeMap: {
                project:({data, context}) => {
                    // next 'from' convert the promise into observable of 1 element (list of users)
                	return from(
                        fetch('https://api.github.com/users?per_page='+data)
                    		.then( resp => resp.json())
                        	.then( users => users.map((user) => ({data:user, context})))
                    ).pipe(
                    // next 'from' convert the list of users into an observable of user
                    	operators.mergeMap((users) => from(users))
                    )
            	}
            },
            view:{
            	vDomMap: (user) => ({
                    class: 'mx-1',
                    tag:'a',
                    style:{display:'block'},
                    href: user.url,
                    innerText:  user.login
                })
            },
            c: {
            	transmissionDelay: 1000
            }
        },
	)
    project = project.addHtml("View", project.summaryHtml())
    project = project.addToCanvas(
        {
    		selector: ({uid}) => uid == 'view',
        	view: (elem) => elem.html()
    	},
        {
    		selector: ({uid}) => uid == 'mergeMap',
        	view: (elem) => ({innerText: 'fetch git-hub users'})
    	},
    	{
    		selector: ({uid}) => uid == 'of',
        	view: (elem) => ({innerText: 'count: '+ elem.configurationInstance.args })
    	},
    	{
    		selector: ({uid}) => uid == 'c',
        	view: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data.login) })
    	}
    )
	return project
}`
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Configurations, Contracts } from '@youwol/vsf-core'
import { mergeMap } from 'rxjs/operators'
import { Observable, of } from 'rxjs'

// noinspection JSValidateJSDoc
/**
 * Configuration of the {@link MergeMap} module.
 *
 * ## Examples
 * ### Re-emit the incoming message with delay:
 * ```
 * {
 *     project: ({data,context}) => {
 *         return of({data,context}).pipe(delay(1000))
 *     }
 * }
 * ```
 * ### Return from an HTTP request:
 * ```
 * {
 *   project:({data, context}) => {
 *      return from(
 *          fetch('https://api.github.com/users?per_page=5')
 *          .then( resp => resp.json())
 *          .then( users => ({data:users, context}) )
 *      )
 * }
 * ```
 * ### Transform an array into an observable emitting each individual item sequentially:
 * ```
 * {
 *   project:({data, context}) => {
 *      // data.values is an array
 *      return from(data.values)
 * }
 * ```
 */
export const configuration = {
    schema: {
        /**
         * A function that, when applied to an item emitted by the source Observable, returns an Observable.
         *
         * Default to `(message) => of(message)`.
         */
        project: new Configurations.JsCode({
            value: (
                message: Modules.ProcessingMessage,
            ): Observable<Modules.OutputMessage> => of(message),
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
    output$: arg.inputs.input$.pipe(
        mergeMap((p) => p.configuration.project(p)),
    ),
})

export function module(fwdParams) {
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}
