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

function error(message)
{
	console.log(`Error: ${message}`);
}

function configure(target)
{
	var path = target.getElementById("Path").value;
	var repo_url = target.getElementById("RepoURL").value;
	console.log("configure @ \""+path+"\" / \""+repo_url+"\"");
}

function push(target)
{
	var user = target.getElementById("Username").value;
	var pass = target.getElementById("Password").value;
	console.log("push @ \""+user+"\" / \""+pass+"\"");
	var tree = browser.bookmarks.getTree();
	tree.then(handle, error);
}

document.addEventListener('DOMContentLoaded', function() {
    var configureButton = document.getElementById("Configure");
    configureButton.addEventListener("click", function()
	{
        configure(document);
    });
    var pushButton = document.getElementById("Push");
    pushButton.addEventListener("click", function()
	{
        push(document);
    });
});
