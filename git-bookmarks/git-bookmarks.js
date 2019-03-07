//const git = require("isomorphic-git");
BrowserFS.configure({"fs": "IndexedDB", "options": {}}, function(problem)
{
	if (problem)
	{
		return console.log(problem);
	}
	window.fs = BrowserFS.BFSRequire("fs");
	//window.process = BrowserFS.BFSRequire("process");
	git.plugins.set("fs", window.fs);
	//git.plugins.set("process", window.process);
});
process.browser = true;
//console.log(BrowserFS);
//console.log(window.fs);
//console.log(git);

function error(message)
{
	console.log(`Error: ${message}`);
}

function setter()
{
	console.log("No error!");
}

function get(getter, key)
{
	getter(function(value)
	{
		console.log(value);
		if (value)
		{
			if (value[key])
			{
				var id = document.getElementById(key);
				id.value = value[key];
				return;
			}
			error("No "+key+" in value!");
		}
		else
		{
			error("No value for "+key+"!");
		}
	});
}

function getPath(getter)
{
	browser.storage.local.get("path").then(getter, error);
}

function getProxy(getter)
{
	browser.storage.local.get("proxy").then(getter, error);
}

function getRepoURL(getter)
{
	browser.storage.local.get("repoURL").then(getter, error);
}

function getBranch(getter)
{
	browser.storage.local.get("branch").then(getter, error);
}

function getAuthor(getter)
{
	browser.storage.local.get("author").then(getter, error);
}

function getCommit(getter)
{
	browser.storage.local.get("commit").then(getter, error);
}

function indent(level)
{
	return "&nbsp;.&nbsp;".repeat(level);
}

async function process(current, level, output, path)
{
	var i;
	var index;
	var children = [];
	console.log("Level: "+level);
	for (i  = 0; i < path.length; ++i)
	{
		children.push(path[i]);
	}
	if (current.url)
	{
		var child = [];
		for (i = 0; i < children.length; ++i)
		{
			child.push(children[i]);
		}
		index = await output(level, current.url, current.title, child, false);
	}
	else
	{
		index = await output(level, current.title, current.title, children, true);
		level += 1;
	}
	children.push(""+index);
	if (current.children)
	{
		var next;
		for (next of current.children)
		{
			var child = [];
			for (i = 0; i < children.length; ++i)
			{
				child.push(children[i]);
			}
			await process(next, level, output, children);
		}
	}
	level -= 1;
	return level;
}

function prepare(name, link)
{
	return "<a href=\""+link+"\">"+name+"</a><br>\n";
}

function report(total, free)
{
	console.log("Total: "+total);
	console.log("Free: "+free);
}

async function handler(nodes)
{
	var root = document.getElementById("path").value;
	var proxy = document.getElementById("proxy").value;
	var repoURL = document.getElementById("repoURL").value;
	var branch = document.getElementById("branch").value;
	var author = document.getElementById("author").value;
	var commit = document.getElementById("commit").value;
	var user = document.getElementById("user").value;
	var pass = document.getElementById("pass").value;
	var content = "";
	var index = 0;
	var input = async function(level, link, name, path, directory)
	{
		var i;
		var line;
		var full = "";
		index += 1;
		for (i = 0; i < path.length; ++i)
		{
			full += path[i]+"/";
		}
		full = root+full;
		console.log("Index: "+index);
		if (directory)
		{
			console.log("Directory: "+full);
			await fs.mkdir(full);
			await new Promise((resolve, reject) => fs.writeFile(
				full+".gitkeep",
				"",
				(problem) => problem ? reject(problem) : resolve()
			));
			//await fs.readdir(full);
		}
		else
		{
			full += index;
			full += ".html";
			line = prepare(name, link);
			content += indent(level)+line;
			console.log("File: "+full);
			console.log(line);
			await new Promise((resolve, reject) => fs.writeFile(
				full,
				line,
				(problem) => problem ? reject(problem) : resolve()
			));
		}
		return index;
	};
	console.log("Here we go, I guess?");
	//await fs.diskSpace(root, report);
	await process(nodes[0], 0, input, []);
	console.log(index);
	//console.log(content);
	console.log("Nodes have been processed...");
	console.log("Clone...");
	await git.clone(
	{
		"dir": root,
		"url": repoURL,
		"ref": branch,
		"singleBranch": true,
		"depth": 1,
		"corsProxy": proxy,
	});
	console.log("Write...");
	await new Promise((resolve, reject) => fs.writeFile(
		root+"index.html",
		content,
		(problem) => problem ? reject(problem) : resolve()
	));
	console.log("Add...");
	await git.add({"dir": root, "filepath": "."});
	console.log("Commit...");
	let sha = await git.commit({
		"dir": root,
		"author":
		{
			"name": author,
			"email": author
		},
		"message": commit
	});
	console.log(sha);
	console.log("Push...");
	let result = await git.push(
	{
		"dir": root,
		"url": repoURL,
		"ref": branch,
		"username": user,
		"password": pass
	});
	if (result)
	{
		if (result["ok"])
		{
			for (ok of result["ok"])
			{
				console.log(ok);
			}
		}
		if (result["errors"])
		{
			for (errors of result["errors"])
			{
				error(errors);
			}
		}
	}
	await fs.rmdir(root);
	return "Done!";
}

function handle(nodes)
{
	handler(nodes).then(console.log);
}

function configure(target)
{
	var path = target.getElementById("path").value;
	var proxy = target.getElementById("proxy").value;
	var repoURL = target.getElementById("repoURL").value;
	var branch = target.getElementById("branch").value;
	var author = target.getElementById("author").value;
	var commit = target.getElementById("commit").value;
	var configuration = {};
	configuration["path"] = path;
	configuration["proxy"] = path;
	configuration["repoURL"] = repoURL;
	configuration["branch"] = branch;
	configuration["author"] = author;
	configuration["commit"] = commit;
	browser.storage.local.set(configuration).then(setter, error);
}

function push()
{
	var tree = browser.bookmarks.getTree();
	tree.then(handle, error);
}

document.addEventListener("DOMContentLoaded", function()
{
	get(getPath, "path");
	get(getProxy, "proxy");
	get(getRepoURL, "repoURL");
	get(getBranch, "branch");
	get(getAuthor, "author");
	get(getCommit, "commit");
    var configureButton = document.getElementById("configure");
    configureButton.addEventListener("click", function()
	{
        configure(document);
    });
    var pushButton = document.getElementById("push");
    pushButton.addEventListener("click", function()
	{
        push();
    });
});
