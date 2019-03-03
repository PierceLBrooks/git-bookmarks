function error(message)
{
	console.log(`Error: ${message}`);
}

function setter()
{
	console.log("No error!");
}

function getPath(getter)
{
	browser.storage.local.get("path").then(getter, error);
}

function getRepoURL(getter)
{
	browser.storage.local.get("repoURL").then(getter, error);
}

function indent(level)
{
	return ".".repeat(level);
}

function process(node, level)
{
	if (node.url)
	{
		console.log(indent(level)+node.url);
	}
	else
	{
		console.log(indent(level)+node.title);
		level += 1;
	}
	if (node.children)
	{
		for (child of node.children)
		{
			process(child, level);
		}
	}
	level -= 1;
}

function handle(nodes)
{
	process(nodes[0], 0);
}

function configure(target)
{
	var path = target.getElementById("path").value;
	var repoURL = target.getElementById("repoURL").value;
	console.log("configure @ \""+path+"\" / \""+repoURL+"\"");
	var configuration = {};
	configuration["path"] = path;
	configuration["repoURL"] = repoURL;
	browser.storage.local.set(configuration).then(setter, error);
}

function push(target)
{
	var user = target.getElementById("user").value;
	var pass = target.getElementById("pass").value;
	console.log("push @ \""+user+"\" / \""+pass+"\"");
	var tree = browser.bookmarks.getTree();
	tree.then(handle, error);
}

document.addEventListener("DOMContentLoaded", function()
{
	getPath(function(value)
	{
		console.log(value);
		if (value)
		{
			if (value["path"])
			{
				var path = document.getElementById("path");
				path.value = value["path"];
				return;
			}
			error("No path in value!");
		}
		else
		{
			error("No value for path!");
		}
	});
	getRepoURL(function(value)
	{
		console.log(value);
		if (value)
		{
			if (value["repoURL"])
			{
				var repoURL = document.getElementById("repoURL");
				repoURL.value = value["repoURL"];
				return;
			}
			error("No repoURL in value!");
		}
		else
		{
			error("No value for repoURL!");
		}
	});
    var configureButton = document.getElementById("configure");
    configureButton.addEventListener("click", function()
	{
        configure(document);
    });
    var pushButton = document.getElementById("push");
    pushButton.addEventListener("click", function()
	{
        push(document);
    });
});
