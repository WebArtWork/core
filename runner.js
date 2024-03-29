const fs = require('fs');
const defaults = {
	module: {
		default: __dirname + '/module/default'
	}
}
const list = {
	'1) waw Angular': 'https://github.com/WebArtWork/wawNgx.git',
	'2) waw Template': 'https://github.com/WebArtWork/wawTemplate.git',
	'3) waw Server': 'https://github.com/WebArtWork/wawServer.git',
	'4) waw Server + Angular + Template': 'https://github.com/WebArtWork/wawNgxPlatform.git',
	'5) waw Server + React Next': 'https://github.com/WebArtWork/wawReactPlatform.git',
	'6) waw Server + Vue Nuxt': 'https://github.com/WebArtWork/wawVuePlatform.git',
	'7) Neryxomka Template': 'https://github.com/WebArtWork/Neryxomka.git'
};
module.exports.love = function (waw) {
	console.log('waw Loves you :) ');
	process.exit(1);
};
/*
*	Create new project
*/
	const new_project = function(waw) {
		if (waw.argv[0] === 'new') {
			waw.argv.shift();
		}
		if (!waw.new_project) {
			waw.new_project = {};
		}
		if (!waw.new_project.name) {
			if (waw.argv.length) {
				if (fs.existsSync(process.cwd()+'/'+waw.argv[0])) {
					console.log('This project already exists in current directory');
					process.exit(0);
				}else{
					waw.new_project.name = waw.argv[0];
				}
			} else {
				return waw.readline.question('Provide name for the project you want to create: ', function(answer){
					if(answer){
						if (fs.existsSync(process.cwd()+'/'+answer)) {
							console.log('This project already exists in current directory');
						}else{
							waw.new_project.name = answer;
						}
					}else{
						console.log('Please type your project name');
					}
					new_project(waw);
				});
			}
		}
		if (!waw.new_project.repo) {
			if(waw.argv.length>1){
				waw.new_project.repo = waw.argv[1];
			}else{
				let text = 'Which project you want to start with?', counter=0, repos={};
				for(let key in list){
					repos[++counter] = list[key];
					text += '\n'+key;
				}
				text += '\nChoose number: ';
				return waw.readline.question(text, function(answer){
					if(!answer||!repos[parseInt(answer)]) return new_project();
					waw.new_project.repo = repos[parseInt(answer)];
					new_project(waw);
				});
			}
		}
		let folder = process.cwd()+'/'+waw.new_project.name;
		fs.mkdirSync(folder, { recursive: true });
		waw.fetch(folder, waw.new_project.repo, () => {
			if (fs.existsSync(folder + '/.git')) {
				fs.rmSync(folder + '/.git', { recursive: true });
			}
			console.log('Your project has been generated successfully');
			process.exit(1);
		}, waw.argv.length > 2 ? waw.argv[2] : 'master');
	};
	module.exports.new = new_project;
	module.exports.n = new_project;
/*
*	Version Management
*/
	const version = function(waw){
		let logs = '';
		if (fs.existsSync(waw.waw_root+'/package.json')) {
			try{
				let config = JSON.parse(fs.readFileSync(waw.waw_root+'/package.json'));
				if(config.version){
					logs = 'waw: ' + config.version;
				}else{
					console.log('Missing files, try to reinstall waw framework.');
					process.exit(1);
				}
			}catch(err){
				console.log('Missing files, try to reinstall waw framework.');
				process.exit(1);
			}
		}
		if(waw.modules.length){
			logs += '\nAccesible Modules: ';
			for (var i = 0; i < waw.modules.length; i++) {
				if(i){
					logs += ', '+waw.modules[i].name;
				}else{
					logs += waw.modules[i].name;
				}
			}

		}
		console.log(logs);
		process.exit(1);
	}
	module.exports['--version'] = version;
	module.exports['-v'] = version;
	module.exports.version = version;
	module.exports.v = version;

/*
*	Modules Management
*/
	const new_module = function (waw) {
		waw.server = typeof waw.server === 'string' ? waw.server : 'server';
		if (!waw.path) {
			if (waw.ensure(process.cwd() + (waw.server ? '/' : ''), waw.server, 'Module already exists', false)) return;
		}
		if (!waw.template) {
			return waw.read_customization(defaults, 'module', () => new_module(waw));
		}
		require(waw.template + '/cli.js')(waw);
	}
	module.exports.add = new_module;
	module.exports.a = new_module;
/*
*	PM2 management
*/
	let pm2;
	const install_pm2 = function(waw, callback){
		if(pm2) return callback();
		if (!fs.existsSync(waw.waw_root+'/node_modules/pm2')) {
			return waw.npmi({
				name: 'pm2',
				version: 'latest',
				path: waw.waw_root,
				forceInstall: true,
				npmLoad: {
					loglevel: 'silent'
				}
			}, function(){
				start(waw);
			});
		}
		if(!pm2) pm2 = require(waw.waw_root+'/node_modules/pm2');
		pm2.connect(function(err) {
			if (err) {
				console.error(err);
				process.exit(2);
			}
			if(!waw.config.pm2) waw.config.pm2={};
			callback();
		});
	}
	const start = function(waw){
		install_pm2(waw, function(){
			pm2.start({
				name: waw.config.name||process.cwd(),
				script: waw.waw_root+'/app.js',
				exec_mode: waw.config.pm2.exec_mode||'fork', //default fork
				instances: waw.config.pm2.instances||1,
				max_memory_restart: waw.config.pm2.memory||'800M'
			}, function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.start = start;
	const stop = function(waw){
		install_pm2(waw, function(){
			pm2.delete(waw.config.name||process.cwd(), function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.stop = stop;
	const restart = function(waw){
		install_pm2(waw, function(){
			pm2.restart(waw.config.name||process.cwd());
		});
	}
	module.exports.restart = restart;
/*
*	End of Core Runners
*/
