/**
 * Visual Studio Flow toolbox wrapping the <a href="https://rxjs.dev/" target="_blank">RxJS</a> library.
 *
 * For comprehensive information about the Visual Studio Flow (vs-flow) environment as a whole, a user guide can be
 * accessed <a href="https://l.youwol.com/doc/@youwol/vs-flow" target="_blank" >here</a>.
 * For developers seeking detailed documentation, please refer to the resources available
 *  <a href="https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/vs-flow&tab=doc" target="_blank" >here</a>.
 *
 * We encourage you to participate in the development process of this toolbox by opening issues or contributing to the
 * project to add new modules and features. Your feedback and contributions are highly appreciated.
 *
 * Illustrative example:
 * <iframe id="iFrameExample" src="" width="100%" height="800px"></iframe>
 * <script>
 *      const src = `return async ({project, cell, env}) => {
 *     const { ReplaySubject } =  rxjs \n
 *     class State{
 *     	constructor(){ this.output$ = new ReplaySubject(1) }
 *         set(v) { this.output$.next({data:v}) }
 *     } \n
 *     project = await project.with({
 *          toolboxes: ['@youwol/vsf-rxjs', '@youwol/vsf-flux-view', '@youwol/vsf-debug'],
 *  		workflow: {
 *  		    branches: ['(of#of)>>(view#input)>#c1>(debounceTime#debounce)>#c2>(console#log)'],
 *       	    configurations: {
 *                  debounce: { dueTime: 500 },
 *                  input: {
 *                      state: new State(),
 *                      outputs: (state) => ({
 *                          output: state.output$
 *                      }),
 *                      vDomMap: (data, mdle) => ({
 *                          style:{
 *                              marginTop:'15px'
 *                          },
 *                          children: [
 *                              { innerText: "Move mouse below"},
 *                              {
 *                                  class:'border mx-auto',
 *                                  style:{width: '20px', height:'15px'},
 *                                  onmousemove: (ev) => mdle.state.set([ev.clientX, ev.clientY])
 *                              }
 *                          ]
 *                      })
 *                  }
 *              }
 *          },
 *          views:[{
 *             id:'View',
 *             html: project.summaryHtml()
 *          }],
 *          flowchart: {
 *             annotations: [
 *                 {
 *                     selector: ({uid}) => ['input'].includes(uid),
 *                     view: (elem) => elem.html()
 *                 },
 *                 {
 *                      selector: ({uid}) => ['debounce'].includes(uid),
 *                      view: (elem) => ({innerText: 'debounce ' + elem.configurationInstance.dueTime + ' ms'})
 *                  },
 *                  {
 *                      selector: ({uid}) => ['c1', 'c2'].includes(uid),
 *                      view: (elem) => ({innerText: env.fv.attr$(elem.end$, (m) => m.data) })
 *                  }
 *             ]
 *         }
 *     })
 * 	return project
 * }
 *  `
 *     const url = '/applications/@youwol/vsf-snippet/latest?tab=dag&content='+encodeURIComponent(src)
 *     document.getElementById('iFrameExample').setAttribute("src",url);
 * </script>
 *
 * @module
 */
export * from './lib'
export { setup } from './auto-generated'
