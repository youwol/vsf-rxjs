import { BehaviorSubject, from, Observable } from 'rxjs'
import { mergeMap, tap } from 'rxjs/operators'
import {
    Attributes,
    ConfigInstance,
    ExecutionJournal,
    Immutable,
    Immutables,
    Modules,
    Projects,
} from '@youwol/vsf-core'

import { Context } from '@youwol/logging'
import { configuration } from './switch-map-macro.module'

/**
 * Configuration of a macro used to generate inner observable for modules requiring such concept.
 */
export const configurationInnerMap = {
    schema: {
        /**
         * Id of the macro in the project.
         */
        macroId: new Attributes.String({
            value: '',
        }),
        /**
         * Configuration of the macro, this configuration depends on the actual macro definition.
         */
        macroConfiguration: Projects.defaultMacroConfig.schema,
        /**
         * The index of the input slot of the macro to forward the message from the outer observable.
         */
        indexSlotEntry: new Attributes.Integer({ value: 0 }),
    },
}

export const inputsInnerMap = {
    input$: {
        description: 'the input stream',
        contract: Modules.expect.ofUnknown,
    },
}

export type PoolReducer = (
    currentPool: Immutable<Projects.InstancePool>,
    newPool: Immutable<Projects.InstancePool>,
) => Projects.InstancePool

const getMacroDeployment = (
    environment: Immutable<Projects.Environment>,
    uid: string,
    config: ConfigInstance<typeof configuration.schema>,
) => ({
    environment: environment,
    scope: {
        uid,
        configuration: config.macroConfiguration,
    },
    chart: {
        modules: [
            {
                uid,
                typeId: config.macroId,
                configuration: config.macroConfiguration,
                toolboxId: Projects.ProjectState.macrosToolbox,
            },
        ],
        connections: [],
    },
})

export function mergeInstancePools(
    uid: string,
    ...pools: Immutables<Projects.InstancePool>
) {
    const modules = pools.reduce((acc, e) => [...acc, ...e.modules], [])
    const connections = pools.reduce((acc, e) => [...acc, ...e.connections], [])
    return new Projects.InstancePool({
        parentUid: uid,
        modules,
        connections,
    })
}

export class State {
    public readonly uid: string
    public readonly instancePool$: BehaviorSubject<
        Immutable<Projects.InstancePool>
    >
    public readonly environment: Immutable<Projects.Environment>
    public readonly poolsReducer: PoolReducer
    public readonly journal: ExecutionJournal
    public readonly overallContext: Context
    public readonly instanceContext: Map<
        Immutable<Modules.ProcessingMessage>,
        Context
    > = new Map()

    private instancePools: Map<
        Immutable<Modules.ProcessingMessage>,
        Promise<Immutable<Projects.InstancePool>>
    > = new Map()
    private index = 0
    private sourceCompleted = false

    constructor(params: {
        uid: string
        environment: Immutable<Projects.Environment>
        poolsReducer: PoolReducer
    }) {
        Object.assign(this, params)
        this.journal = new ExecutionJournal({
            logsChannels: this.environment.logsChannels,
        })
        this.instancePool$ = new BehaviorSubject(
            new Projects.InstancePool({ parentUid: this.uid }),
        )
        this.overallContext = this.journal.addPage({
            title: `overall`,
        })
    }

    sourceObservableCompleted() {
        this.sourceCompleted = true
        this.overallContext.info('Source observable completed')
    }

    isSourceObservableCompleted() {
        return this.sourceCompleted
    }

    async newMacroInstance(
        message: Immutable<
            Modules.ProcessingMessage<
                unknown,
                ConfigInstance<typeof configuration.schema>
            >
        >,
    ): Promise<{
        macro: Immutable<Modules.ImplementationTrait>
        context: Context
    }> {
        // Do not be tempted to use this.instancePool$.value as initial pool to avoid the latter 'reduce':
        // this code is executed in parallel and this.instancePool$.value is likely to return the empty InstancePool
        // even if it is not the first call to `newMacroInstance`.
        this.index += 1
        const config = message.configuration
        const uid = `${config.macroId}#${this.index}`
        return await this.overallContext.withChildAsync(uid, async (ctx) => {
            const instanceCtx = this.journal.addPage({
                title: uid,
                context: ctx,
            })
            this.instanceContext.set(message, instanceCtx)
            const deployment = getMacroDeployment(this.environment, uid, config)
            this.instancePools.set(
                message,
                new Projects.InstancePool({ parentUid: this.uid }).deploy(
                    deployment,
                    instanceCtx,
                ),
            )
            const instancePool = await this.instancePools.get(message)
            const reducedPool = this.poolsReducer(
                this.instancePool$.value,
                instancePool,
            )
            this.instancePool$.next(reducedPool)
            return { macro: instancePool.modules[0], context: instanceCtx }
        })
    }

    clearMacroInstance(message) {
        this.overallContext.info('Trigger teardown of macro', {
            fromMessage: message,
        })

        if (this.instancePools.has(message)) {
            this.instancePools.get(message).then((pool) => {
                const ctx = this.instanceContext.get(message)
                ctx.info('Teardown macro')
                pool.stop()
                ctx.end()
                this.instancePools.delete(message)
            })
        }
    }
}

export function innerObservable(
    state: Immutable<State>,
    message: Immutable<
        Modules.ProcessingMessage<
            unknown,
            ConfigInstance<typeof configurationInnerMap.schema>
        >
    >,
): Observable<Immutable<Modules.OutputMessage<unknown>>> {
    return from(state.newMacroInstance(message)).pipe(
        tap(({ macro, context }) => {
            context.info('Macro instance created', macro)
            const inputs: Immutables<Modules.InputSlot> = Object.values(
                macro.inputSlots,
            )
            const index = message.configuration.indexSlotEntry
            if (index < inputs.length) {
                context.info("Send input to first macro's input slot.", message)
                inputs[index].rawMessage$.next({
                    data: message.data,
                    context: message.context,
                })
                inputs[index].rawMessage$.complete()
            }
        }),
        mergeMap(({ macro, context }) => {
            const outputs: Immutables<Modules.OutputSlot> = Object.values(
                macro.outputSlots,
            )
            context.info(
                `Stream from macro's output '${outputs[0].slotId}'.`,
                message,
            )
            return outputs[0].observable$.pipe(
                tap(
                    (m) => {
                        context.info('Send output', m)
                    },
                    (error) => {
                        context.error(error)
                    },
                    () => {
                        context.info('Inner observable completed')
                        context.end()
                        if (state.isSourceObservableCompleted()) {
                            state.overallContext.end()
                        }
                    },
                ),
            )
        }),
    )
}
