const fs = require('fs');
const path = require('path');
const { products } = require('../../../[Tutsgalaxy.com] - NodeJS - The Complete Guide/06 Working with Dynamic Content  Adding Templating Engines/089 05-working-on-layout-with-partials/05-working-on-layout-with-partials/routes/admin');

const p = path.join(
    path.dirname(process.mainModule.filename), 
    'data', 
    'products.json'
    );

const getProductsFromFile = callback => {
    fs.readFile(p, (err, fileContent) => {
        if (err) {
            callback([]);
        }
        else {
            callback(JSON.parse(fileContent));
        }
    })
}

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save () {
        // saving product in a file
        getProductsFromFile(products => {
            products.push(this);

            fs.writeFile(p, JSON.stringify(products), err => {
                console.log(err)
            })
        })    
    }

    // static allows to fetch data directly 
    // from the Product class and not obj created
    static fetchAll (callback) {
       getProductsFromFile(callback);
    }
}