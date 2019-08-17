import program from 'commander';
import chalk from 'chalk';
import path from 'path';
import fse from 'fs-extra';
import {EmitType} from '../lib/index';
import {PublishActionBase, PublishActionOptions} from '../lib/action/action-base';
import {NPMPublishAction} from '../lib/action/npm-git-publish';
import {JekyllPublishAction} from '../lib/action/jekyll-git-publish';
import {HugoPublishAction} from '../lib/action/hugo-git-publish';
import {DEFAULT_HUGO_VERSION} from '../consts';
import {CopyPublishAction} from '../lib/action/copy-git-publish';

const manifest = require(path.resolve(__dirname, '../../package.json'));

function parameterList(str: string, list: Array<string>): Array<string> {
	list.push(str);
	return list;
}

function parameterBool(val: string): boolean {
	return val === 'true' || val === 'yes' || val === '1';
}

export class DeplokayCLI {

	protected async emit(task: { id: string }, type: EmitType, state: string, details: string): Promise<void> {
		switch (type) {
			case EmitType.LOG:
				if (details.length > 0) {
					console.log(' ', chalk.gray(details));
				}
				return;
			case EmitType.DONE:
				state = chalk.green(state);
				break;
			case EmitType.FINISH:
				state = chalk.green(state);
				break;
			case EmitType.ERROR:
				state = chalk.red(state);
				break;
			case EmitType.OPERATION:
				state = chalk.cyan(state);
				break;
			case EmitType.SUCCESS:
				state = chalk.greenBright(state);
				details = chalk.gray(details);
				break;
		}
		const taskPrefix = task.id ? `[${task.id}] ` : '';
		const line = `${taskPrefix}${state}${(type === EmitType.SUCCESS && (details.length > 0) ? '\n' : ' ')}${details}`;
		console.log(line);
	}

	protected programOptions(prog: program.CommanderStatic) {
		prog
			.option('--id [id]', 'id for the task')

			.option('--mode <mode>', 'kind of project to publish (npm|jekyll|hugo|copy)')

			.option('--local [path]', '[source.local] local git repository path')

			.option('--repository [url]', '[source.remote] git repository url')
			.option('--branch [name]', '[source.remote] branch to publish e.g. "master"')
			.option('--checkout_path [path]', '[source.remote] working directory to checkout and build')

			.option('--npm_release_component [name]', '[build.npm] a file or folder name to copy to the release folder, e.g. "dist" or "package.json" (multiple --nc allowed)', parameterList, [])
			.option('--npm_release_folder [name]', '[build.npm] a folder name to copy its content to the release folder, e.g. "dist"  (multiple --nf allowed)', parameterList, [])
			.option('--npm_cmd_name [name]', '[build.npm] npm build script name e.g. "build:deploy"')
			.option('--npm_slim_package [boolean]', '[build.npm] strip development dependencies from package.json and generate a slim package-lock.json', parameterBool, false)

			.option('--hugo_version [version]', '[build.hugo] hugo version to download', DEFAULT_HUGO_VERSION)
			.option('--hugo_extended [boolean]', '[build.hugo] npm build script name e.g. "build:prod"', parameterBool, false)

			.option('--archive_path [path]', '[publish.archive] destination directory for compressed archive files to publish')
			.option('--archive_name [name]', '[publish.archive] base name for the archive file e.g. "project-pack"')
			.option('--publish_path [path]', '[publish.folder] destination directory to publish')
			.option('--target_branch [name]', '[publish.branch] destination branch to publish')
			.option('--target_branch_tag [boolean]', '[build.branch] create a release git tag', parameterBool, true)

			.option('-d, --disable_colors', 'no colored output');
	}

	protected cliOptions(prog: program.CommanderStatic): PublishActionOptions {
		const result: PublishActionOptions = {
			id: prog.id || '',
			source: {},
			build: {},
			publish: {}
		};
		if (prog.local) {
			result.source.local = {
				path: prog.local,
			};
		}
		if (prog.repository || prog.branch || prog.checkout_path) {
			result.source.remote = {
				repository: prog.repository,
				branch: prog.branch,
				checkout_path: prog.checkout_path,
			};
		}
		switch (prog.mode) {
			case 'npm':
				result.build.npm = {
					slim_package: prog.npm_slim_package,
					folder_names: prog.npm_release_folder,
					component_names: prog.npm_release_component,
					cmd_name: prog.npm_cmd_name
				};
				break;
			case 'jekyll':
				result.build.jekyll = {};
				break;
			case 'copy':
				result.build.copy = {};
				break;
			case 'hugo':
				result.build.hugo = {
					version: prog.hugo_version,
					extended: prog.hugo_extended,
				};
				break;
		}
		if (prog.archive_path || prog.archive_name) {
			result.publish.archive = {
				path: prog.archive_path,
				name: prog.archive_name
			};
		}
		if (prog.publish_path) {
			result.publish.folder = {
				path: prog.publish_path
			};
		}
		if (prog.target_branch) {
			result.publish.branch = {
				branch: prog.target_branch,
				disableTag: !prog.target_branch_tag
			};
		}
		return result;
	}

	protected async run(opts: PublishActionOptions): Promise<void> {
		let action: PublishActionBase<any>;
		if (opts.build.npm) {
			action = new NPMPublishAction(opts, {id: opts.id}, this.emit);
		} else if (opts.build.jekyll) {
			action = new JekyllPublishAction(opts, {id: opts.id}, this.emit);
		} else if (opts.build.hugo) {
			action = new HugoPublishAction(opts, {id: opts.id}, this.emit);
		} else if (opts.build.copy) {
			action = new CopyPublishAction(opts, {id: opts.id}, this.emit);
		} else {
			return Promise.reject('Invalid Build Mode');
		}
		await action.run();
	}

	protected async start(): Promise<void> {
		program
			.version(manifest.version)
			.option('-c, --config [filename]', 'specify a json config file');
		this.programOptions(program);
		program.parse(process.argv);
		if (program.no_colors) {
			chalk.enabled = false;
		}
		let options: any;
		if (program.config) {
			options = await fse.readJson(program.config);
		} else {
			options = this.cliOptions(program);
		}
		await this.emit({id: options.id}, EmitType.OPERATION, 'start', 'Checking Parameters');
		this.run(options).then(() => {
			return this.emit({id: options.id}, EmitType.FINISH, chalk.magenta('done'), '🍓');
		}).catch(e => {
			return this.emit({id: options.id}, EmitType.ERROR, 'error', e.toString());
		});
	}

	main() {
		this.start();
	}
}


const cli = new DeplokayCLI();
cli.main();
