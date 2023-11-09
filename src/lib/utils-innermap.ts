import { map, shareReplay } from 'rxjs/operators'
import {
    Configurations,
    Deployers,
    Modules,
    Contracts,
    Immutable,
} from '@youwol/vsf-core'
import { Observable, of } from 'rxjs'

/**
 * Configuration for module consuming inner observables (e.g. mergeMap, switchMap, etc).
 *
 * Inner observables can be provided using the `project` function returning either an observable or
 * a `Macros.MacroAsObservableSpec` (from @youwol/vsf-core) object that allows to define an observable from a macro.
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
 *
 * ### From a macro:
 * ```
 * {
 *   project:(message) => {
 *      // data.values is an array
 *      return {
 *          macroTypeId:'macro-example',
 *          inputSlot: 0,
 *          outputSlot: 0,
 *          message,
 *          configuration:{
 *              // Macro configuration
 *          }
 *      }
 * }
 * ```
 */
export const higherOrderConfig = {
    schema: {
        /**
         * A function that, when applied to an item emitted by the source Observable, returns an Observable.
         *
         * See also `Macros.MacroAsObservableSpec` from the library `@youwol/vsf-core`.
         *
         * Default to `(message) => of(message)`.
         */
        project: Modules.jsCodeAttribute({
            value: (
                message: Modules.ProcessingMessage,
            ):
                | Observable<Modules.OutputMessage>
                | Deployers.VsfInnerObservable => of(message),
        }),
    },
}

export const higherOrderInputs = {
    input$: {
        description: 'the input stream',
        contract: Contracts.ofUnknown,
    },
}

export function higherOrderOutputs<T extends Configurations.Schema>(policy) {
    return (
        arg: Modules.OutputMapperArg<
            T,
            typeof inputs,
            Deployers.InnerObservablesPool
        >,
    ) =>
        ({
            output$: arg.inputs.input$.pipe(
                policy((message) => {
                    const projected = message.configuration.project(message)
                    if (projected instanceof Observable) {
                        return projected
                    }
                    return arg.state.inner$(projected, {
                        from: 'input$',
                        to: 'output$',
                    })
                }),
                // This may be optional at some point
                shareReplay({ bufferSize: 1, refCount: true }),
            ),
            instancePool$: arg.state.instancePool$.pipe(
                map((pool) => ({ data: pool, context: {} })),
            ),
        }) as {
            instancePool$: Observable<{
                data: Deployers.InstancePool
                context: Record<string, never>
            }>
            output$: Observable<
                | Modules.OutputMessage<unknown>
                | Immutable<Modules.OutputMessage<unknown>>
            >
        }
}
export type Policy = 'switch' | 'merge' | 'concat'
export const partialConfiguration = {
    schema: {
        innerMacro: {
            macroTypeId: Modules.stringAttribute({ value: '' }),
            configuration: {
                workersPoolId: Modules.stringAttribute({ value: '' }),
            },
            inputIndex: Modules.integerAttribute({ value: 0 }),
            outputIndex: Modules.integerAttribute({ value: 0 }),
        },
        purgeOnTerminated: Modules.booleanAttribute({ value: true }),
    },
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Contracts.ofUnknown,
    },
}
