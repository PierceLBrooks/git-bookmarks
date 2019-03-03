function handle()
{
}

function configure(target)
{
	path = target.getElementById("Path").value;
	repo_url = target.getElementById("RepoURL").value;
	console.log("configure @ \""+path+"\" / \""+repo_url+"\"");
}

function push(target)
{
	user = target.getElementById("Username").value;
	pass = target.getElementById("Password").value;
	console.log("push @ \""+user+"\" / \""+pass+"\"");
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
