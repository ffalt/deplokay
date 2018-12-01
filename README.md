# deplokay

deplokay is a deployment helper (CLI/Library) for node. 

* pull a git branch or use a local git

* run a build process: jekyll, hugo or anything you can build with npm

   * jekyll: a jekyll version according to your Gemfile is downloaded into the build folder
   * hugo: a hugo version according to the options is downloaded into the build folder
   * npm: if your project uses external tools you need to install them yourself

* publish the result to a branch, to a zip archive, to a folder

## Requirements

[https://nodejs.org/](https://nodejs.org/)

[https://npmjs.com/](https://npmjs.com/)

if you want to build with [jekyll](https://jekyllrb.com/):
[https://bundler.io/](Bundler) is needed to install a local jekyll per project

## Installation

### As standalone CLI

npm install github:ffalt/deplokay#releases --g

### As development dependency CLI

npm install github:ffalt/deplokay#releases --save-dev

### As library

npm install github:ffalt/deplokay#releases

## Usage

### As standalone CLI

a global npm install registers a command line tool

```
Usage: deplokay [options]

Options:
  -V, --version                   output the version number
  -c, --config [filename]         specify a json config file
  --id [id]                       id for the task
  --mode <mode>                   kind of project to publish (npm|jekyll|hugo|copy)
  --local [path]                  [source.local] local git repository path
  --repository [url]              [source.remote] git repository url
  --branch [name]                 [source.remote] branch to publish e.g. "master"
  --checkout_path [path]          [source.remote] working directory to checkout and build
  --npm_release_component [name]  [build.npm] a file or folder name to copy to the release folder, e.g. "dist" or "package.json" (multiple --nc allowed) (default: [])
  --npm_release_folder [name]     [build.npm] a folder name to copy its content to the release folder, e.g. "dist"  (multiple --nf allowed) (default: [])
  --npm_cmd_name [name]           [build.npm] npm build script name e.g. "build:deploy"
  --npm_slim_package [boolean]    [build.npm] strip development dependencies from package.json and generate a slim package-lock.json (default: false)
  --hugo_version [version]        [build.hugo] hugo version to download (default: "0.51")
  --hugo_extended [boolean]       [build.hugo] npm build script name e.g. "build:prod" (default: false)
  --archive_path [path]           [publish.archive] destination directory for compressed archive files to publish
  --archive_name [name]           [publish.archive] base name for the archive file e.g. "project-pack"
  --publish_path [path]           [publish.folder] destination directory to publish
  --target_branch [name]          [publish.branch] destination branch to publish
  -d, --disable_colors            no colored output
  -h, --help                      output usage information
  
```

### As development dependency CLI

npm registers the tools into your project './node_modules/.bin'

you can use it e.g. within a 'package.json'

```
 "scripts": {
    "deploy:archive": "deplokay -c ./deplokay-archive-config.json",
    "deploy:branch": "deplokay -c ./deplokay-branch-config.json"
  },
```

and start it with npm

```
npm run deploy:archive
```

### As library

typescript example 
```

import {EmitFunction, EmitType, JekyllPublishAction, PublishActionOptions} from 'deplokay';

async function (opts: PublishActionOptions): Promise<void> {
	const action = new JekyllPublishAction(opts, {}, (task: any, type: EmitType, state: string, details: string) => {
	    console.log('progress', state, details);
	));
	await this.action.run();
}

```

oldschool example 

```

var deplokay = require('deplokay');

function (opts, cb) {
	const action = new deplokay.NPMPublishAction(opts, {}, function(task, type, state, details) {
	    console.log('progress', state, details);
	));
	this.action.run()
	    .then(function() {
	        cb();
	    }.catch(function(e) {
	        console.error(e);
	    });
}

```

classes available: 'JekyllPublishAction', 'HugoPublishAction', 'NPMPublishAction', 'CopyPublishAction'

## Options and File Format

```
// fields with ? are optional

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
			component_names: Array<string>;
			/**
			 * a list of folders names to copy their content to the release folder, e.g. "dist"
			 */
			folder_names: Array<string>;
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
		 * environment variables passed to jekyl, hugo and npm e.g.  "JEKYLL_ENV": "production"
		 */
		[name: string]: string;
	};
}
```

