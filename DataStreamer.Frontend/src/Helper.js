export const openFile = (fileType) => {
    return new Promise((resolve, reject) => {
        const input = document.createElement("INPUT");
        input.type = "file";
        input.hidden = "true";

        if (fileType) {
            input.accept = fileType;
        }
        document.body.appendChild(input);
        input.addEventListener("change", function(e) {
            const files = e.target.files;
            var toLoad = files.length;
            if (!toLoad) {
                return; //NOTE: Reject isn't called as it makes it consistent with when the 'Cancel' button is clicked in the open dialog, which cannot be detected.
            }

            const fileContents = {};        
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function (loader) {
                const contents = loader.target.result;
                fileContents[file.name] = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    content: contents
                };
                toLoad--;

                if (toLoad === 0) {
                    resolve(fileContents);
                }
            };
            reader.readAsText(file);
        });

        input.click();

        setTimeout(function() {
            document.body.removeChild(input);
        }, 99000);
    });
}