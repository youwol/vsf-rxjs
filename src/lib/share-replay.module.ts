// noinspection JSValidateJSDoc

/**
 * This module wrap the [shareReplay](https://rxjs.dev/api/index/function/shareReplay) operator of [RxJs](https://rxjs.dev/).
 *
 * It allows multiple subscribers to share the same source observable and
 * replay a specified number of emitted values to new subscribers.
 *
 * See {@link configuration} to setup the module.
 *
 * @module
 */
import { Modules, Contracts } from '@youwol/vsf-core'
import { shareReplay } from 'rxjs/operators'

export const configuration = {
    schema: {
        /**
         * Size of the buffer.
         */
        bufferSize: Modules.integerAttribute(
            { value: undefined },
            { override: 'final' },
        ),

        /**
         *  If true, unsubscribe the source when the reference counter drops to zero.
         */
        refCount: Modules.booleanAttribute(
            { value: true },
            { override: 'final' },
        ),
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
        shareReplay({
            bufferSize: arg.configuration.bufferSize,
            refCount: true,
        }),
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
