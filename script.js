async function pickAssetFolder() {
    try {
        //get folder
        const folder = await window.showDirectoryPicker()
        //iterate over the entries in a folder
        getAssetFiles(folder)
    } catch (err) {

    }
}
//stupid class, because I like classes
class sFile {
    constructor (name,b64) {
        this.meta = [name.split(".")[0],b64]
    }
}
async function getAssetFiles(folder) {
    //all assets that need to be added
    const assets = []
    //all file entries
    const files = await folder.entries()
    //iterate forever...
    while (true) {
        //get the next file
        const file = await files.next()
        //...well until there are no more files
        if (!file.value) break;
        //seperate function for file.getFile(
        const actualFile = await handleAssetFile(file)
        const readFile = await read(actualFile)
        if (readFile) {
            assets.push(readFile)
        }
    }
    makeJSFile(assets)
}

async function read(file) {
    //make it asynchronus
    return new Promise((resolve,reject) => {
        const reader = new FileReader()
        reader.onload = function (event) {
            if (!res) {
                reject("No base 64 for some reason")
            }
            //get the base64
            let res = reader.result.toString()
            //seperate the b64 from the garbage
            res = res.split(",")[1]
            //add it to the filesJS object so it can be handled by files.js
            filesJS[file.name] = res
            //handle it in files.js
            res = getFile(file.name)
            //create an sFile object, again, because I like classes
            const fileThing = new sFile(file.name,res)
            //end the promise
            resolve(fileThing)
        }
        try {
            //if the file isn't a file then return false
            reader.readAsDataURL(file)
        } catch {
            resolve(false)
        }
    }) 
}
async function handleAssetFile(file) {
    try {
        //iterate over file values in case of unexpected case where there are more than two values returned from a file
        const actualFile = await getActualFile(file)
        //I could have just used return but I didn't
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
        //return the file handle
        return fileX.getFile()
    }
    //there is no file so return false
    return false
}
//make the js file so you can use it wherever 
async function makeJSFile(assets) {
    //create the files object
    let fileText = "const files = { \n \n}\n"
    //iterate over all the assets
    for (let x = 0; x < assets.length; x ++) {
        //use the data from an sFile
        const meta = assets[x].meta
        const name = meta[0]
        const b64 = meta[1]
        //add it to the "files" object
        fileText += `files['${name}'] = "${b64}" \n`
    }
    //make the assets.js file
    const file = new File([fileText],"assets.js")
    //get the base64 for downloading
    const b64 = await getDownloadableJS(file)
    //make an <a> element
    const link = document.createElement("a")
    //set the name of the downloaded file
    link.download = "assets.js"
    //give the data of the file
    link.href = b64
    //download the file
    link.click()
}
async function getDownloadableJS(js) {
    //make it asynchronus
    return new Promise((resolve,reject) => {
        const reader = new FileReader()
        reader.onload = function (event) {
            const res = event.target.result
            resolve(res)
        }
        //read the file as base 64
        reader.readAsDataURL(js)
    }) 
}
