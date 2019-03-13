///*
//const git = require("isomorphic-git");
BrowserFS.configure({"fs": "IndexedDB", "options": {}}, async function(problem)
{
	if (problem)
	{
		return console.log(problem);
	}
	window.fs = BrowserFS.BFSRequire("fs");
	//window.process = BrowserFS.BFSRequire("process");
	git.plugins.set("fs", window.fs);
	//git.plugins.set("process", window.process);
	files = await git.listFiles(
	{
		"dir": "/"
	});
	console.log(files);
});
process.browser = true;
//console.log(BrowserFS);
//console.log(window.fs);
//console.log(git);
//*/

/*
window.fs = new LightningFS("fs", { "wipe": true });
git.plugins.set("fs", window.fs);
window.pfs = pify(window.fs);
process.browser = true;
*/

function error(message)
{
	console.log(`Error: ${message}`);
}

function setter()
{
	console.log("No error!");
}

function get(getter, key, check)
{
	getter(function(value)
	{
		console.log(value);
		if (value)
		{
			if (value[key])
			{
				var id = document.getElementById(key);
				if (check)
				{
					id.checked = value[key];
				}
				else
				{
					id.value = value[key];
				}
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

function getFormat(getter)
{
	browser.storage.local.get("format").then(getter, error);
}

function indent(level)
{
	return "&nbsp;*&nbsp;".repeat(level);
}

function replace(string, search, replacement)
{
	return string.split(search).join(replacement);
}

function solve(string)
{
	var solution;
	solution = replace(string, "\"", "&quot;");
	solution = replace(solution, "'", "&apos;");
	solution = replace(solution, "&", "&amp;");
	solution = replace(solution, "<", "&lt;");
	solution = replace(solution, ">", "&gt;");
	return solution;
}

async function process(current, level, output, format)
{
	var i;
	var index;
	var basis = level;
	var content = "";
	//console.log("Level: "+level);
	if (format)
	{
		content += "\t".repeat(level);
	}
	content += "<bookmark ";
	if (current.title)
	{
		if (format)
		{
			content += "\n"+("\t".repeat(level))+"\t";
		}
		content += "name=\""+solve(current.title)+"\" ";
		if (current.children)
		{
			level += 1;
			index = await output(level, current.title, current.title, true);
		}
		else
		{
			if (current.url)
			{
				index = await output(level, current.url, current.title, false);
				if (format)
				{
					content += "\n"+("\t".repeat(level))+"\t";
				}
				content += "url=\""+solve(current.url)+"\" ";
			}
			else
			{
				index = await output(level, current.title, current.title, false);
			}
		}
	}
	else
	{
		if (current.url)
		{
			if (format)
			{
				content += "\n"+("\t".repeat(level))+"\t";
			}
			content += "url=\""+solve(current.url)+"\" ";
			if (current.children)
			{
				level += 1;
				index = await output(level, current.url, current.url, true);
			}
			else
			{
				index = await output(level, current.url, current.url, false);
			}
		}
		else
		{
			if (current.children)
			{
				level += 1;
				index = await output(level, "", "", true);
			}
			else
			{
				index = await output(level, "", "", false);
			}
		}
	}
	if (format)
	{
		content += "\n"+("\t".repeat(basis))+"\t";
	}
	content += "index=\""+index+"\">\n";
	if (current.children)
	{
		var next;
		level += 1;
		for (next of current.children)
		{
			content += await process(next, level, output, format);
		}
		level -= 1;
	}
	if (format)
	{
		content += "\t".repeat(basis);
	}
	content += "</bookmark>\n";
	level -= 1;
	return content;
}

function prepare(name, target)
{
	return "<a href=\""+target+"\">"+name+"</a><br>\n";
}

function report(result)
{
	console.log(result);
	document.getElementById("report").innerHTML = result;
}

async function write(path, content)
{
	///*
	await new Promise((resolve, reject) => fs.writeFile(
		path,
		content,
		(problem) => problem ? reject(problem) : resolve()
	));
	//*/
	//await pfs.writeFile(path, content, "utf8");
	return "Done!";
}

async function handler(nodes)
{
	var root = document.getElementById("path").value;
	var proxy = document.getElementById("proxy").value;
	var repoURL = document.getElementById("repoURL").value;
	var branch = document.getElementById("branch").value;
	var author = document.getElementById("author").value;
	var commit = document.getElementById("commit").value;
	var format = document.getElementById("format").checked;
	var user = document.getElementById("user").value;
	var pass = document.getElementById("pass").value;
	var contentHTML = "";
	var contentXML = "";
	var index = 0;
	var head;
	var tail;
	var input = async function(level, target, name, directory)
	{
		var i;
		var line;
		var full = "";
		index += 1;
		//console.log("Index: "+index);
		if (directory)
		{
			line = solve(name)+"<br>\n";
		}
		else
		{
			line = prepare(solve(name), target);
		}
		if (format)
		{
			contentHTML += "\t\t";
		}
		contentHTML += indent(level)+line;
		//console.log("File: "+full);
		//console.log(line);
		//write(full, line);
		return index;
	};
	//await fs.diskSpace(root, report);
	console.log(index);
	//console.log(content);
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
	console.log("Process...");
	contentXML += await process(nodes[0], 1, input, format);
	/*
	files = await git.listFiles(
	{
		"dir": root
	});
	*/
	console.log(files);
	console.log("Write...");
	head = "<!doctype html>\n<html>\n\t<head>\n";
	if (format)
	{
		head += "\t\t<title>git-bookmarks</title>\n\t</head>\n\t";
	}
	else
	{
		head += "<title>git-bookmarks</title></head>";
	}
	head += "<body>\n";
	tail = "\t</body>\n</html>\n";
	contentHTML = head+contentHTML+tail;
	write(root+"index.html", contentHTML);
	head = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bookmarks>\n";
	tail = "</bookmarks>\n";
	contentXML = head+contentXML+tail;
	write(root+"index.xml", contentXML);
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
			var ok;
			for (ok of result["ok"])
			{
				console.log(ok);
			}
		}
		if (result["errors"])
		{
			var errors;
			for (errors of result["errors"])
			{
				error(errors);
			}
		}
	}
	//await pfs.rmdir(root);
	return "Done!";
}

function handle(nodes)
{
	handler(nodes).then(report);
}

function configure(target)
{
	var path = target.getElementById("path").value;
	var proxy = target.getElementById("proxy").value;
	var repoURL = target.getElementById("repoURL").value;
	var branch = target.getElementById("branch").value;
	var author = target.getElementById("author").value;
	var commit = target.getElementById("commit").value;
	var format = target.getElementById("format").checked;
	var configuration = {};
	configuration["path"] = path;
	configuration["proxy"] = proxy;
	configuration["repoURL"] = repoURL;
	configuration["branch"] = branch;
	configuration["author"] = author;
	configuration["commit"] = commit;
	configuration["format"] = format;
	browser.storage.local.set(configuration).then(setter, error);
}

function push()
{
	var tree = browser.bookmarks.getTree();
	tree.then(handle, error);
}

document.addEventListener("DOMContentLoaded", function()
{
	get(getPath, "path", false);
	get(getProxy, "proxy", false);
	get(getRepoURL, "repoURL", false);
	get(getBranch, "branch", false);
	get(getAuthor, "author", false);
	get(getCommit, "commit", false);
	get(getFormat, "format", true);
    var configureButton = document.getElementById("configure");
    configureButton.addEventListener("click", function()
	{
        configure(document);
    });
    var pushButton = document.getElementById("push");
    pushButton.addEventListener("click", function()
	{
		report("Waiting...");
        push();
    });
});
