// deleting files from the file system
const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            // throw err
            console.log(err)
        }
    })
}

exports.deleteFile = deleteFile;