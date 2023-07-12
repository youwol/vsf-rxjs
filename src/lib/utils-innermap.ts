import { concatMap, map, mergeMap, switchMap } from 'rxjs/operators'
import {
    Attributes,
    extendConfig,
    extractConfigWith,
    Modules,
    Projects,
} from '@youwol/vsf-core'

export type Policy = 'switch' | 'merge' | 'concat'
export const partialConfiguration = {
    schema: {
        innerMacro: {
            macroTypeId: new Attributes.String({ value: '' }),
            configuration: {
                workersPoolId: new Attributes.String({ value: '' }),
            },
            inputIndex: new Attributes.Integer({ value: 0 }),
            outputIndex: new Attributes.Integer({ value: 0 }),
        },
        purgeOnTerminated: new Attributes.Boolean({ value: true }),
    },
}

export const inputs = {
    input$: {
        description: 'the input stream',
        contract: Modules.expect.ofUnknown,
    },
}

export const outputs = (
    arg: Modules.OutputMapperArg<
        typeof partialConfiguration.schema,
        typeof inputs,
        Projects.InnerMacrosPool
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
    const configuration = extendConfig({
        configuration: partialConfiguration,
        target: ['innerMacro', 'configuration'],
        with: model.configuration.schema,
    })
    const configInstance = extractConfigWith({
        configuration,
        values: fwdParams.configurationInstance,
    })

    const orchestrators: Record<
        Policy,
        Projects.InnerMacrosOrchestrationTrait
    > = {
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
    const state = new Projects.InnerMacrosPool({
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
