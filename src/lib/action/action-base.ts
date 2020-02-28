import path from 'path';
import {EmitFunction} from '..';
import {PublishToBranchRun, PublishToBranchRunOptions} from '../run/publish-branch';
import {PublishToFolderRun, PublishToFolderRunOptions} from '../run/publish-folder';
import {PublishToArchiveRun, PublishToArchiveRunOptions} from '../run/publish-archive';
import {GitFolderOptions, GitFolderRun} from '../run/git-folder';
import {getGitSummary} from '../utils';

/**
 * Deplokay Config Format
 */
export interface PublishActionOptions {
	/**
	 * The schema file for the config.json e.g. "config-schema.json"
	 */
	$schema?: string;
	/**
	 * identifier (for logging & progress callbacks, not used internally)
	 */
	id?: string;
	/**
	 * source git settings
	 */
	source: {
		/**
		 * local git source
		 */
		local?: {
			/**
			 * a local git project folder to publish e.g. "/Users/you/projects/awesome/"
			 */
			path: string;
		};
		/**
		 * remote git source
		 */
		remote?: {
			/**
			 *  branch of the remote git e.g. "master"
			 */
			branch: string;
			/**
			 * the local path where to checkout the remote git e.g. "./temp/awesome-project-deploy/"
			 */
			checkout_path: string;
			/**
			 * a remote git project url e.g. 'https://github.com/ffalt/deplokay.git"
			 */
			repository: string;
		};
	};
	/**
	 * build settings
	 */
	build: {
		/**
		 * build with npm
		 */
		npm?: {
			/**
			 * a npm build script name e.g. "build:production"
			 */
			cmd_name: string;
			/**
			 * a list of files|folders names to copy to the release folder, e.g. ["dist","package.json"]]
			 */
			component_names?: Array<string>;
			/**
			 * a list of folders names to copy their content to the release folder, e.g. "dist"
			 */
			folder_names?: Array<string>;
			/**
			 * strip development dependencies from package.json and generate a slim package-lock.json, default false
			 */
			slim_package?: boolean;
		},
		/**
		 * build with hugo
		 */
		hugo?: {
			/**
			 * hugo version to download
			 */
			version?: string;
			/**
			 * hugo extended version to download, default 'false'
			 */
			extended?: boolean;
		},
		/**
		 * build with jekyll
		 */
		jekyll?: {};
		/**
		 * just copy the full source folder
		 */
		copy?: {};
	};
	/**
	 * publish settings
	 */
	publish: {
		/**
		 * publish to branch
		 */
		branch?: {
			/**
			 *  the branch where to post the release e.g. "releases"
			 */
			branch: string;
			/**
			 *  disable creating a git tag
			 */
			disableTag?: boolean;
		};
		/**
		 * publish to folder
		 */
		folder?: {
			/**
			 * a folder where the release is copied e.g. "/var/www/awesome-site/"
			 */
			path: string;
		};
		/**
		 * publish as archive file
		 */
		archive?: {
			/**
			 * a base name for the archive file e.g. "awesome-pack"
			 */
			name?: string;
			/**
			 * a folder where the archive file is written e.g. "./releases/zip/"
			 */
			path: string;
		};
	};
	/**
	 * environment variables passed to external tools
	 */
	env?: {
		/**
		 * environment variables passed to jekyll, hugo and npm e.g.  "JEKYLL_ENV": "production"
		 * if you want to use a specific bundler for jekyll use "BUNDLE": "/your/path/to/bundle"
		 */
		[name: string]: string;
	};
}

export abstract class PublishActionBase<T extends PublishActionOptions> {

	constructor(protected opts: T, protected task: any, protected emit: EmitFunction) {
	}

	public async validateOptions(): Promise<void> {
		if (!this.opts.source) {
			return Promise.reject('Missing Option Node "source": Please provide a source configuration');
		}
		if (!this.opts.source.local && !this.opts.source.remote) {
			return Promise.reject('Missing Options in "source": Please provide a source configuration');
		}
		if (this.opts.source.local && this.opts.source.remote) {
			return Promise.reject('Invalid Options in "source": Please provide only one source configuration');
		}
		if (this.opts.source.local) {
			if (!this.opts.source.local.path) {
				return Promise.reject('Missing Option "source.local.source_path": Please provide a source configuration');
			}
		}
		if (this.opts.source.remote) {
			if (!this.opts.source.remote.repository) {
				return Promise.reject('Missing Option "source.remote.repository": Please provide a git repository');
			}
			if (!this.opts.source.remote.branch) {
				return Promise.reject('Missing Option "source.remote.branch": Please provide a git branch e.g. "master"');
			}
			if (!this.opts.source.remote.checkout_path) {
				return Promise.reject('Invalid Option "source.remote.checkout_path": Please provide a path where to checkout and build the project');
			}
		}
		if (this.opts.publish) {
			if (this.opts.publish.branch) {
				if (!this.opts.publish.branch.branch) {
					return Promise.reject('Missing Option "publish.branch.branch": Please provide a git target branch e.g. "releases"');
				}
			}
			if (this.opts.publish.folder) {
				if (!this.opts.publish.folder.path) {
					return Promise.reject('Invalid Option "publish.folder.path": Please provide a path where to publish the output');
				}
			}
			if (this.opts.publish.archive) {
				if (!this.opts.publish.archive.path) {
					return Promise.reject('Invalid Options "publish.archive.path": Please provide a path where to publish the output archive');
				}
			}
		}
		if (!this.opts.publish || (!this.opts.publish.branch && !this.opts.publish.folder && !this.opts.publish.archive)) {
			return Promise.reject('Invalid Option "publish.(folder|archive|branch)": Please provide at least one publish option');
		}

		if (!this.opts.build) {
			return Promise.reject('Missing Option "build": Please provide a build option node');
		}

		if (!this.opts.build.npm && !this.opts.build.jekyll && !this.opts.build.hugo && !this.opts.build.copy) {
			return Promise.reject('Invalid Option "build.(jekyll|npm|hugo|copy)": Please provide at least one build mode option');
		}

		if (Object.keys(this.opts.build).length !== 1) {
			return Promise.reject('Invalid Option "build.(mode)": Please provide only one build mode option');
		}

		if (this.opts.build.npm) {
			if (!this.opts.build.npm.cmd_name) {
				return Promise.reject('Missing Option "build.npm.cmd_name": Please provide a npm build script name e.g. "build:deploy"');
			}
			const parts = (this.opts.build.npm.component_names || []).concat(this.opts.build.npm.folder_names || []);
			if (parts.length === 0) {
				return Promise.reject('Invalid Options "build.npm.(components|folders)": Please provide at least on element to copy to the release folder e.g. "dist"');
			}
		}
	}

	async abstract run(): Promise<void>;

	protected async runSource(): Promise<{ build_path: string, version: string, name: string }> {
		if (this.opts.source.remote) {
			const git = new GitFolderRun(this.emit, this.task);
			let GIT_REPO = this.opts.source.remote.repository;
			if (GIT_REPO[0] === '.') {
				GIT_REPO = path.resolve(GIT_REPO);
			}
			const gitOptions: GitFolderOptions = {
				GIT_REPO,
				GIT_DIR: path.resolve(this.opts.source.remote.checkout_path),
				GIT_BRANCH: this.opts.source.remote.branch
			};
			await git.run(gitOptions);
			const summary = await getGitSummary(path.resolve(this.opts.source.remote.checkout_path));
			return {build_path: path.resolve(this.opts.source.remote.checkout_path), version: summary.version, name: summary.name};
		} else if (this.opts.source.local) {
			const summary = await getGitSummary(this.opts.source.local.path);
			return {build_path: path.resolve(this.opts.source.local.path), version: summary.version, name: summary.name};
		} else {
			return Promise.reject('Invalid Config');
		}
	}

	async runPublish(build_path: string, dist_path: string, name: string, version: string): Promise<void> {
		if (!this.opts.publish) {
			return;
		}
		if (this.opts.publish.branch) {
			const gitBranchOptions: PublishToBranchRunOptions = {
				GIT_DIR: build_path,
				SOURCE_DIR: dist_path,
				DISABLE_TAG: !!this.opts.publish.branch.disableTag,
				RELEASE_DIR: path.resolve(build_path, '.releases'),
				RELEASE_BRANCH: this.opts.publish.branch.branch
			};
			const gitBranch = new PublishToBranchRun(this.emit, this.task);
			await gitBranch.run(gitBranchOptions);
		}

		if (this.opts.publish.archive) {
			const archiveOptions: PublishToArchiveRunOptions = {
				SOURCE_DIR: dist_path,
				ARCHIVE_DIR: path.resolve(this.opts.publish.archive.path),
				NAME: this.opts.publish.archive.name || name,
				VERSION: version
			};
			const publish = new PublishToArchiveRun(this.emit, this.task);
			await publish.run(archiveOptions);
		}

		if (this.opts.publish.folder) {
			const publishOptions: PublishToFolderRunOptions = {
				SOURCE_DIR: dist_path,
				PUBLISH_DIR: path.resolve(this.opts.publish.folder.path)
			};
			const publish = new PublishToFolderRun(this.emit, this.task);
			await publish.run(publishOptions);
		}

	}
}
