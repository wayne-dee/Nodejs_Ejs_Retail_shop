const products = [];

module.exports = class Product {
    constructor(t) {
        this.title = t;
    }

    save () {
        products.push(this);
    }

    // static allows to fetch data directly 
    // from the Product class and not obj created
    static fetchAll () {
        return products
    }
}