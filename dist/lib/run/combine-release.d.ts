import { Run } from './run-base';
export interface CombineReleaseOptions {
    SOURCE_DIR: string;
    RELEASE_DIR: string;
    COMPONENTS: Array<string>;
    FOLDERS: Array<string>;
    GENERATE_SLIM_PACKAGE: boolean;
    BUILD_ENV?: {
        [name: string]: string;
    };
}
export declare class CombineReleaseRun extends Run<CombineReleaseOptions> {
    private configureNPMJson;
    run(opts: CombineReleaseOptions): Promise<void>;
}
