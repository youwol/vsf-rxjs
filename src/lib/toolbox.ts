import { Modules } from '@youwol/vsf-core'
import { module as ofModule } from './of.module'
import { module as fromModule } from './from.module'
import { module as filterModule } from './filter.module'
import { module as mapModule } from './map.module'
import { module as takeModule } from './take.module'
import { module as mergeMapModule } from './merge-map.module'
import { module as timerModule } from './timer.module'
import { module as combineLatestModule } from './combine-latest.module'
import { module as mergeModule } from './merge.module'
import { module as forkJoinModule } from './fork-join.module'
import { module as reduceModule } from './reduce.module'
import { module as debounceTime } from './debounce-time.module'
import { module as shareReplayModule } from './share-replay.module'
import { module as delay } from './delay.module'
import { module as switchMapModule } from './switch-map.module'
import { module as concatMapModule } from './concat-map.module'
import { module as scanModule } from './scan.module'
import { module as mapReduceModule } from './map-reduce.module'
import { basePathDoc, urlModuleDoc } from './constants'
import { setup } from '../auto-generated'

export function toolbox() {
    return {
        name: 'rxjs',
        uid: setup.name,
        origin: {
            packageName: setup.name,
            version: setup.version,
        },
        documentation: `${basePathDoc}.html`,
        icon: {
            svgString: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) -->
<path fill="indigo"  d="M16 128h416c8.84 0 16-7.16 16-16V48c0-8.84-7.16-16-16-16H16C7.16 32 0 39.16 0 48v64c0 8.84 7.16 16 16 16zm480 80H80c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h416c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16zm-64 176H16c-8.84 0-16 7.16-16 16v64c0 8.84 7.16 16 16 16h416c8.84 0 16-7.16 16-16v-64c0-8.84-7.16-16-16-16z"/>
</svg>`,
        },
        modules: [
            new Modules.Module({
                declaration: {
                    typeId: 'of',
                    documentation: urlModuleDoc('RxJS', 'Of'),
                },
                implementation: ({ fwdParams }) => {
                    return ofModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'from',
                    documentation: urlModuleDoc('RxJS', 'From'),
                },
                implementation: ({ fwdParams }) => {
                    return fromModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'filter',
                    documentation: urlModuleDoc('RxJS', 'Filter'),
                },
                implementation: ({ fwdParams }) => {
                    return filterModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'map',
                    documentation: urlModuleDoc('RxJS', 'Map'),
                },
                implementation: ({ fwdParams }) => {
                    return mapModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'take',
                    documentation: urlModuleDoc('RxJS', 'Take'),
                },
                implementation: ({ fwdParams }) => {
                    return takeModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'mergeMap',
                    documentation: urlModuleDoc('RxJS', 'MergeMap'),
                },
                implementation: ({ fwdParams }) => {
                    return mergeMapModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'timer',
                    documentation: urlModuleDoc('RxJS', 'Timer'),
                },
                implementation: ({ fwdParams }) => {
                    return timerModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'combineLatest',
                    documentation: urlModuleDoc('RxJS', 'CombineLatest'),
                },
                implementation: ({ fwdParams }) => {
                    return combineLatestModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'merge',
                    documentation: urlModuleDoc('RxJS', 'Merge'),
                },
                implementation: ({ fwdParams }) => {
                    return mergeModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'forkJoin',
                    documentation: urlModuleDoc('RxJS', 'ForkJoin'),
                },
                implementation: ({ fwdParams }) => {
                    return forkJoinModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'reduce',
                    documentation: urlModuleDoc('RxJS', 'Reduce'),
                },
                implementation: ({ fwdParams }) => {
                    return reduceModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'debounceTime',
                    documentation: urlModuleDoc('RxJS', 'DebounceTime'),
                },
                implementation: ({ fwdParams }) => {
                    return debounceTime(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'delay',
                    documentation: urlModuleDoc('RxJS', 'Delay'),
                },
                implementation: ({ fwdParams }) => {
                    return delay(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'shareReplay',
                    documentation: urlModuleDoc('RxJS', 'ShareReplay'),
                },
                implementation: ({ fwdParams }) => {
                    return shareReplayModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'switchMap',
                    documentation: urlModuleDoc('RxJS', 'SwitchMap'),
                },
                implementation: ({ fwdParams }) => {
                    return switchMapModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'concatMap',
                    documentation: urlModuleDoc('RxJS', 'ConcatMap'),
                },
                implementation: ({ fwdParams }) => {
                    return concatMapModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'scan',
                    documentation: urlModuleDoc('RxJS', 'Scan'),
                },
                implementation: ({ fwdParams }) => {
                    return scanModule(fwdParams)
                },
            }),
            new Modules.Module({
                declaration: {
                    typeId: 'mapReduce',
                    documentation: urlModuleDoc('RxJS', 'MapReduce'),
                },
                implementation: ({ fwdParams }) => {
                    return mapReduceModule(fwdParams)
                },
            }),
        ],
    }
}
