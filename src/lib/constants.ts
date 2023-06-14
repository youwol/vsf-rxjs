import { setup } from '../auto-generated'

export const basePathDoc = `/api/assets-gateway/raw/package/${setup.assetId}/${setup.version}/dist/docs/modules`

export const urlModuleDoc = (toolbox, module) => `${basePathDoc}/${module}.html`
