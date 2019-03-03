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
	return ".".repeat(level);
}

function process(node, level, output)
{
	if (node.url)
	{
		output(level, node.url);
	}
	else
	{
		output(level, node.title);
		level += 1;
	}
	if (node.children)
	{
		for (child of node.children)
		{
			process(child, level, output);
		}
	}
	level -= 1;
	return level;
}

function prepare(level, string)
{
	return indent(level)+string+"\n";
}

async function handler(nodes)
{
	var path = document.getElementById("path").value;
	var repoURL = document.getElementById("repoURL").value;
	var branch = document.getElementById("branch").value;
	var author = document.getElementById("author").value;
	var commit = document.getElementById("commit").value;
	var user = document.getElementById("user").value;
	var pass = document.getElementById("pass").value;
	var content = "";
	var index = 0;
	var input = function(level, string)
	{
		var line = prepare(level, string);
		console.log(index);
		console.log(line);
		index += 1;
		content += line;
	};
	console.log("Here we go, I guess?");
	if (process(nodes[0], 0, input) > 0)
	{
		return "Node processing failure...";
	}
	console.log(index);
	//console.log(content);
	console.log("Nodes have been processed...");
	console.log("Clone...");
	await git.clone(
	{
		"dir": path,
		"url": repoURL,
		"ref": branch,
		"singleBranch": true,
		"depth": 1,
		"corsProxy": "https://cors.isomorphic-git.org",
	});
	console.log("Write...");
	await new Promise((resolve, reject) => fs.writeFile(
		path+"test.txt",
		content,
		(problem) => problem ? reject(problem) : resolve()
	));
	console.log("Add...");
	await git.add({"dir": path, "filepath": "."});
	console.log("Commit...");
	let sha = await git.commit({
		"dir": path,
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
		"dir": path,
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
	return "Done!";
}

function handle(nodes)
{
	handler(nodes).then(console.log);
}

function configure(target)
{
	var path = target.getElementById("path").value;
	var repoURL = target.getElementById("repoURL").value;
	var branch = target.getElementById("branch").value;
	var author = target.getElementById("author").value;
	var commit = target.getElementById("commit").value;
	var configuration = {};
	configuration["path"] = path;
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
