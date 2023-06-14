import { Modules } from '@youwol/vsf-core'

export function createVariableInputs(conf: { inputsCount: number }) {
    const inputsCount = (conf && conf.inputsCount) || 2
    return Array.from(Array(inputsCount)).reduce(
        (acc, _, i) => ({
            ...acc,
            [`input_${i}`]: {
                description: `the input stream ${i}`,
                contract: Modules.expect.ofUnknown,
            },
        }),
        {},
    )
}
