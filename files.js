
const filesJS = {
    
}

const mime = {
    "png": "image/png",
    "webp": "image/webp",
    "jpg": "image/jpg",
    "glb": "model/gltf-binary",
    "json": "application/json",
    "svg": "image/svg+xml",
    "xml": "image/svg+xml",
}

var warningGiven = false;

function getFile(name) {
    if (!window.location.href.replace(/^.*\:\/\//, "").includes(":") && !window.location.href.includes("file") || window.location.href.includes("localhost")) {
        if (!warningGiven) {
            console.log("Loading files from the server...");
            warningGiven = true;
        }
        return "../static/threejs/media/" + name;
    } else {
        if (filesJS[name] != undefined) {
            if (mime[name.split(".")[1]] != undefined) {
                return "data:" + mime[name.split(".")[1]] + ";base64," + filesJS[name];
            } else {
                console.error("'" + name.split(".")[1] + "' is not in MIME mappings!")
            }
        } else {
            console.error("'" + name + "' is not encoded in your files.js!");
        }
    }
}
;