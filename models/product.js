const fs = require('fs');
const path = require('path');

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save () {
        // saving product in a file
        const p = path.join(
            path.dirname(process.mainModule.filename), 
            'data', 
            'products.json'
            );
        
            fs.readFile(p, (err, fileContent) => {
                let products = [];
                if (!err) {
                    products = JSON.parse(fileContent)
                }
                products.push(this);

                fs.writeFile(p, JSON.stringify(products), err => {
                    console.log(err)
                })
            })
    }

    // static allows to fetch data directly 
    // from the Product class and not obj created
    static fetchAll (callback) {
        const p = path.join(
            path.dirname(process.mainModule.filename), 
            'data', 
            'products.json'
            );
        
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return callback([]);
            }
            return callback(JSON.parse(fileContent));
        })
    }
}