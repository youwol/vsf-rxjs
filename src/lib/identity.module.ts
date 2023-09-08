/**
 *
 * A module that forward as it is any incoming messages.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *   const src = `return async ({project, cell, env}) => {
    project = await project.import('@youwol/vsf-rxjs', '@youwol/vsf-flux-view')
    project = await project.parseDag([
        '(from#from)>#c>(identity#identity)>>(accView#view)',
        ],{
        from: { input: [[1, 2, 3], [4, 5, 6]]},
        view: {
            containerAttributes: { class:'rounded p-1 border', style:{marginTop:'15px'}},
            vDomMap: (data) => ({ innerText: 'received: '+ data })
        },
        c: { transmissionDelay: 1000 }
    })
    project = project.addHtml("View", project.summaryHtml())
    project = project.addToCanvas({
        selector: ({uid}) => uid == 'view',
        view: (elem) => elem.html()
    })
    project = project.addToCanvas({
        selector: ({uid}) => uid == 'from',
        view: () => ({innerText:'[[1,2,3], [4,5,6]]'})
    })
    project = project.addToCanvas({
        selector: (elem) => elem.uid == 'c',
        view: (c) => ({ innerText: env.fv.attr$( c.end$, ({data}) =>  data ) })
    })
    return project
  }
 `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 * @module
 */
import { Modules, Contracts } from '@youwol/vsf-core'

export const configuration = {
    schema: {},
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
    output$: arg.inputs.input$,
})

export function module(fwdParams) {
    return new Modules.Implementation<
        typeof configuration.schema,
        typeof inputs
    >(
        {
            configuration,
            inputs,
            outputs,
        },
        fwdParams,
    )
}
