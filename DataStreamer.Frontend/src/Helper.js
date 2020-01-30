export const openFile = (accept, multiple) => {
    return new Promise((resolve, reject) => {
        const input = document.createElement("INPUT");
        input.type = "file";
        if (multiple) {
            input.multiple = true;
        }
        if (accept) {
            input.accept = accept;
        }
        document.body.appendChild(input);
        input.addEventListener("change", function(e) {
            const files = e.target.files;
            var toLoad = files.length;
            if (!toLoad) {
                return; //NOTE: Reject isn't called as it makes it consistent with when the 'Cancel' button is clicked in the open dialog, which cannot be detected.
            }

            const fileContents = {};

            for (var index = 0; index < files.length; index++) {
                const file = files[index];
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
            }
        });

        input.click();

        setTimeout(function() {
            document.body.removeChild(input);
        });
    });
}