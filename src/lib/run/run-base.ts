import {EmitFunction, EmitType} from '..';

export abstract class Run<T> {

	constructor(private emitter: EmitFunction, private task: any) {
	}

	async emit(type: EmitType, state: string, details: string) {
		await this.emitter(this.task, type, state, details);
	}

	abstract async run(opts: T): Promise<void>;
}
