/**
 *
 * A module that forward as it is any incoming messages.
 *
 * Below is an example illustrating the module's usage.
 *
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *   const src = `return async ({project, cell, env}) => {
    return await project.with({
        toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view'],
        flowchart: {
            branches: ['(from#from)>#c>(identity#identity)>>(accView#view)'],
            configurations: {
                from: { input: [[1, 2, 3], [4, 5, 6]]},
                view: {
                    containerAttributes: { class:'rounded p-1 border d-flex flex-column', style:{marginTop:'15px'}},
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
