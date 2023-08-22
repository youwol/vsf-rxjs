import { concatMap, map, mergeMap, switchMap } from 'rxjs/operators'
import { Configurations, Modules, Contracts, Macros } from '@youwol/vsf-core'

export type Policy = 'switch' | 'merge' | 'concat'
export const partialConfiguration = {
    schema: {
        innerMacro: {
            macroTypeId: new Configurations.String({ value: '' }),
            configuration: {
                workersPoolId: new Configurations.String({ value: '' }),
            },
            inputIndex: new Configurations.Integer({ value: 0 }),
            outputIndex: new Configurations.Integer({ value: 0 }),
        },
        purgeOnTerminated: new Configurations.Boolean({ value: true }),
    },
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Contracts.ofUnknown,
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof partialConfiguration.schema,
        typeof inputs,
        Macros.InnerMacrosPool
    >,
) => {
    return {
        output$: arg.state.result$({
            outer$: arg.inputs.input$,
        }),
        instancePool$: arg.state.instancePool$.pipe(
            map((pool) => ({ data: pool, context: {} })),
        ),
    }
}

export function module(policy: Policy, fwdParams: Modules.ForwardArgs) {
    const model = fwdParams.environment.macrosToolbox.modules.find(
        (m) =>
            m.declaration.typeId ==
            fwdParams.configurationInstance.innerMacro['macroTypeId'],
    ).declaration['macroModel']
    const configuration = Configurations.extendConfig({
        configuration: partialConfiguration,
        target: ['innerMacro', 'configuration'],
        with: model.configuration.schema,
    })
    const configInstance = Configurations.extractConfigWith({
        configuration,
        values: fwdParams.configurationInstance,
    })

    const orchestrators: Record<Policy, Macros.InnerMacrosOrchestrationTrait> =
        {
            switch: {
                orchestrate: switchMap,
            },
            merge: {
                orchestrate: mergeMap,
            },
            concat: {
                orchestrate: concatMap,
            },
        }
    const state = new Macros.InnerMacrosPool({
        parentUid: fwdParams.uid,
        environment: fwdParams.environment,
        purgeOnTerminated: configInstance.purgeOnTerminated,
        orchestrator: orchestrators[policy],
    })
    return new Modules.Implementation(
        {
            configuration,
            inputs,
            outputs,
            state,
            journal: state.journal,
            instancePool: state.instancePool$,
        },
        fwdParams,
    )
}
