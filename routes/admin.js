const path = require('path');

const express = require('express');

const productsContoller = require('../controllers/products');

const router = express.Router();


// /admin/add-product => GET
router.get('/add-product', productsContoller.getAddProduct);

// /admin/add-product => POST
router.post('/add-product', productsContoller.postAddProduct);

module.exports = router;

