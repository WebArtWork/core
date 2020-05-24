const fs = require('fs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source => {
	if (!fs.existsSync(source)) {
		return []; 
	}
	return fs.readdirSync(source).map(name => require('path').join(source, name)).filter(isDirectory);
}
const git_fetch = function(git, location, repo, branch='master', cb = ()=>{}){
	let git_repo = git(location);
	git_repo.init(function(){
		git_repo.addRemote('origin', repo, function(err){
			git_repo.fetch('--all', function(err){
				git_repo.reset('origin/'+branch, cb);
			});
		});
	});
}
/*
*	Framework update
*/
	module.exports.renew = function(params){
		git_fetch(params.git, params.waw_root, 'https://github.com/WebArtWork/waw.git', 'dev', ()=>{
			console.log('Framework has been updated');
			process.exit(1);
		});
	};
/*
*	Create new project
*/
	const list = {
		'1) Angular New': 'https://github.com/WebArtWork/wawNgx.git',
		'2) React New': 'https://github.com/WebArtWork/wawReact.git',
		'3) Vue New': 'https://github.com/WebArtWork/wawVue.git',
		'4) Angular CRM': 'https://github.com/WebArtWork/wawNgxCrm.git',
		'5) React CRM': 'https://github.com/WebArtWork/wawReactCrm.git',
		'6) Vue CRM': 'https://github.com/WebArtWork/wawVueCrm.git',
		'7) Angular eCommerce': 'https://github.com/WebArtWork/wawNgxeCommerce.git',
		'8) React eCommerce': 'https://github.com/WebArtWork/wawReacteCommerce.git',
		'9) Vue eCommerce': 'https://github.com/WebArtWork/wawVueeCommerce.git',
		'10) Angular Social Network': 'https://github.com/WebArtWork/wawNgxSocial.git',
		'11) React Social Network': 'https://github.com/WebArtWork/wawReactSocial.git',
		'12) Vue Social Network': 'https://github.com/WebArtWork/wawVueSocial.git',
		'13) Angular Profile': 'https://github.com/WebArtWork/wawNgxProfile.git',
		'13) React Profile': 'https://github.com/WebArtWork/wawReactProfile.git',
		'14) Vue Profile': 'https://github.com/WebArtWork/wawVueProfile.git'
	};
	const new_project = function(params) {
		if(!params.new_project) params.new_project={};
		if(!params.new_project.name){
			if(params.argv.length){
				if (fs.existsSync(process.cwd()+'/'+params.argv[0])) {
					console.log('This project already exists in current directory');
					process.exit(0);
				}else{
					params.new_project.name = params.argv[0];
				}
			}else{
				return readline.question('Provide name for the project you want to create: ', function(answer){
					if(answer){
						if (fs.existsSync(process.cwd()+'/'+answer)) {
							console.log('This project already exists in current directory');
						}else{
							params.new_project.name = answer;
						}
					}else{
						console.log('Please type your project name');
					}
					new_project(params);
				});
			}
		}
		if(!params.new_project.repo){
			if(params.argv.length>1){
				params.new_project.repo = params.argv[1];				
			}else{
				let text = 'Which project you want to start with?', counter=0, repos={};
				for(let key in list){
					repos[++counter] = list[key];
					text += '\n'+key;
				}
				text += '\nChoose number: ';
				return readline.question(text, function(answer){
					if(!answer||!repos[parseInt(answer)]) return new_project();
					params.new_project.repo = repos[parseInt(answer)];
					new_project(params);					
				});
			}
		}
		let folder = process.cwd()+'/'+params.new_project.name;
		fs.mkdirSync(folder, { recursive: true });
		let repo = params.git(folder);
		repo.init(function(){
			repo.addRemote('origin', params.new_project.repo, function(err){
				repo.fetch('--all', function(err){
					let branch = 'master';
					if(params.argv.length>2){
						branch = params.argv[2];
					}
					repo.reset('origin/'+branch, err=>{
						console.log('Your project has been generated successfully');
						process.exit(1);
					});
				});
			});
		});
	};
	module.exports.new = new_project;
	module.exports.n = new_project;
/*
*	Create new part
*/
	const new_part = function(params) {
		if (!fs.existsSync(process.cwd()+'/config.json')) {
			console.log('You are located not in waw project');
			process.exit(0);
		}
		if(!params.new_part) params.new_part={};
		if(!params.new_part.name){
			if(params.argv.length){
				if (fs.existsSync(process.cwd()+'/server/'+params.argv[0].toLowerCase())) {
					console.log('This part already exists in current project');
					process.exit(0);
				}else{
					params.new_part.name = params.argv[0];
				}
			}else{
				return readline.question('Provide name for the part you want to create: ', function(answer){
					if(answer){
						if (fs.existsSync(process.cwd()+'/'+answer.toLowerCase())) {
							console.log('This part already exists in current project');
						}else{
							params.new_part.name = answer;
						}
					}else{
						console.log('Please type your project name');
					}
					new_part(params);
				});
			}
		}
		let folder = process.cwd()+'/server/'+params.new_project.name;
		if(params.argv.length > 1){
			fs.mkdirSync(folder, { recursive: true });
			let repo = params.git(folder);
			repo.init(function(){
				repo.addRemote('origin', params.argv[1], function(err){
					repo.fetch('--all', function(err){
						let branch = 'master';
						if(params.argv.length>2){
							branch = params.argv[2];
						}
						repo.reset('origin/'+branch, err=>{
							console.log('Part has been created');
							process.exit(1);
						});
					});
				});
			});
		}else{
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(folder+'/index.js', `module.exports = function(waw) {\n\t// add your router code\n};`, 'utf8');
			let data = `{\n\t"name": "CNAME",\n\t"router": "index.js",\n\t"dependencies": {}\n}`;
			data = data.split('CNAME').join(params.new_part.name.toString().charAt(0).toUpperCase() + params.new_part.name.toString().substr(1).toLowerCase());
			data = data.split('NAME').join(params.new_part.name.toLowerCase());
			fs.writeFileSync(folder+'/part.json', data, 'utf8');
			console.log('Part has been created');
			process.exit(1);
		}
	};
	module.exports.add = new_part;
	module.exports.a = new_part;
/*
*	Version Management
*/
	const version = function(params){
		let logs = '';
		if (fs.existsSync(params.waw_root+'/package.json')) {
			try{
				let config = JSON.parse(fs.readFileSync(params.waw_root+'/package.json'));
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
		if(params.parts.length){
			logs += '\nAccesible Parts: ';
			for (var i = 0; i < params.parts.length; i++) {
				if(i){
					logs += ', '+params.parts[i];
				}else{
					logs += params.parts[i];
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
*	Git Management
*/
	const generate = function(params){
		if(!params.argv.length){
			console.log('Please provide part name');
			process.exit(1);
		}
		let name = params.argv.shift();
		if(params._parts[name.toLowerCase()]){
			console.log('This part already exists.');
			process.exit(1);
		}
		const global_part = params.origin_argv[1].toLowerCase() == 'global' || params.origin_argv[1].toLowerCase() == 'pg';
		if(global_part && !params.argv.length){
			console.log('To install global part you has to provide repo link.');
			process.exit(1);
		}
		let repo_link;
		if(params.argv.length){
			repo_link = params.argv.shift();
		}
		let folder = (global_part&&params.waw_root||process.cwd())+'/server/'+name;
		fs.mkdirSync(folder, { recursive: true });
		if(repo_link){
			let repo = params.git(folder);
			repo.init(function(){
				repo.addRemote('origin', repo_link, function(err){
					repo.fetch('--all', function(err){
						let branch = 'master';
						if(params.argv.length){
							branch = params.argv.shift();
						}
						repo.reset('origin/'+branch, err=>{
							console.log('Part has been created');
							process.exit(1);
						});
					});
				});
			});
		}else{
			fs.writeFileSync(folder+'/index.js', `module.exports = function(waw) {\n\t// add your router code\n};`, 'utf8');
			let data = `{\n\t"name": "CNAME",\n\t"router": "index.js",\n\t"dependencies": {}\n}`;
			data = data.split('CNAME').join(name.toString().charAt(0).toUpperCase() + name.toString().substr(1).toLowerCase());
			data = data.split('NAME').join(name.toLowerCase());
			fs.writeFileSync(folder+'/part.json', data, 'utf8');
			console.log('Part has been created');
			process.exit(1);
		}
	}
	const parts_renew = function(params){
		let parts = getDirectories(params.waw_root+'/server');
		let counter = 0;
		for (var i = 0; i < parts.length; i++) {
			if (fs.existsSync(parts[i]+'/part.json')) {
				let config = JSON.parse(fs.readFileSync(parts[i]+'/part.json'));
				if(config.git && config.git.repo){
					counter++;
					git_fetch(params.git, parts[i], config.git.repo, config.git.branch||'master', ()=>{
						if(--counter === 0){
							console.log('All global parts has been updated');
							process.exit(1);
						}
					});
				}
			}
		}
		if(!counter){
			console.log('All global parts has been updated');
			process.exit(1);
		}
	}
	const part = function(params){
		if(!params.argv.length){
			console.log('Please provide git command');
			process.exit(1);
		}
		let command = params.argv.shift().toLowerCase();
		if(command == 'new' || command == 'global'){
			return generate(params);
		}
		if(!params.argv.length){
			console.log('Please provide part name');
			process.exit(1);
		}
		let part = params.argv.shift();
		if(!params._parts[part]){
			console.log("There is no such part");
			process.exit(1);
		}
		if(!params._parts[part].git || !params._parts[part].git.repo){
			console.log("Part don't have git config");
			process.exit(1);
		}
		switch(command){
			case 'renew':
				return parts_renew(params);
			case 'fetch':
				let repo = params.git(params._parts[part].__root);
				repo.init(function(){
					repo.addRemote('origin', params._parts[part].git.repo, function(err){
						repo.fetch('--all', function(err){
							repo.reset('origin/'+(params._parts[part].git.branch||'master'), ()=>{
								console.log('Part has been fetched');
								process.exit(1);
							});
						});
					});
				});
				return false;
			default:
				console.log('Please provide correct git command. Type `waw part help`');
				process.exit(1);
		}
	}
	module.exports.part = part;
	module.exports.pr = parts_renew;
	module.exports.pn = generate;
	module.exports.pg = generate;
/*
*	PM2 management
*/
	let pm2;
	const install_pm2 = function(callback){
		if(pm2) return callback();
		if (!fs.existsSync(__dirname+'/node_modules/pm2')) {
			return params.npmi({
				name: 'pm2',
				version: 'latest',
				path: __dirname,
				forceInstall: true,
				npmLoad: {
					loglevel: 'silent'
				}
			}, function(){
				start(params);
			});
		}
		if(!pm2) pm2 = require('pm2');
		pm2.connect(function(err) {
			if (err) {
				console.error(err);
				process.exit(2);
			}
			callback();
		});
	}
	const start = function(params){
		install_pm2(function(){
			pm2.start({
				name: params.config.name||process.cwd(),
				script: params.waw_root+'/app.js',
				exec_mode: 'cluster',
				instances: 1,
				max_memory_restart: '800M'
			}, function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.start = start;
	const stop = function(params){
		install_pm2(function(){
			pm2.stop(params.config.name||process.cwd(), function(err, apps) {
				pm2.disconnect();
				process.exit(2);
			});
		});
	}
	module.exports.stop = stop;
	const restart = function(params){
		install_pm2(function(){
			pm2.restart(params.config.name||process.cwd());
		});
	}
	module.exports.restart = restart;
/*
*	End of Core Runners
*/