async function pickAssetFolder() {
    try {
        const folder = await window.showDirectoryPicker()
        getAssetFiles(folder)
    } catch (err) {

    }
}

class sFile {
    constructor (name,b64) {
        this.meta = [name.split(".")[0],b64]
    }
}
async function getAssetFiles(folder) {
    const assets = []
    const files = await folder.entries()
    while (true) {
        const file = await files.next()
        if (!file.value) break;
        const actualFile = await handleAssetFile(file)
        const readFile = await read(actualFile)
        if (readFile) {
            assets.push(readFile)
        }
    }
    makeJSFile(assets)
}

async function read(file) {
    return new Promise((resolve,reject) => {
        const reader = new FileReader()
        reader.onload = function (event) {
            let res = event.target.result
            // console.log(res)
            if (!res) {
                reject("No base 64 for some reason")
            }
            res = reader.result.toString()
            res = res.split(",")[1]
            filesJS[file.name] = res
            res = getFile(file.name)
            console.log(res)
            const fileThing = new sFile(file.name,res)
            resolve(fileThing)
        }
        try {
            console.log(file)
            reader.readAsDataURL(file)
        } catch {
            resolve(false)
        }
    }) 
}
async function handleAssetFile(file) {
    try {
        const actualFile = await getActualFile(file)
        if (!actualFile) throw new Error()
        return actualFile
    } catch {

    }
}
async function getActualFile(file) {
    for (let x = 0; x < file.value.length; x ++) {
        const fileX = file.value[x]
        //check if it's a file handle
        if (!fileX.name) continue
        return fileX.getFile()
    }
    return false
}
async function makeJSFile(assets) {
    let fileText = "const files = { \n \n}\n"
    for (let x = 0; x < assets.length; x ++) {
        const meta = assets[x].meta
        const name = meta[0]
        const b64 = meta[1]
        fileText += `files['${name}'] = "${b64}" \n`
    }
    const file = new File([fileText],"assets.js")
    const b64 = await getDownloadableJS(file)
    const link = document.createElement("a")
    link.download = "assets.js"
    link.href = b64
    link.click()
}
async function getDownloadableJS(js) {
    return new Promise((resolve,reject) => {
        const reader = new FileReader()
        reader.onload = function (event) {
            const res = event.target.result
            resolve(res)
        }
        reader.readAsDataURL(js)
    }) 
}