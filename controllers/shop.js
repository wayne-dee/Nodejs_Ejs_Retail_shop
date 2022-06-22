const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_51LDB9OFo3u2z8VQ9r9dkc60UraAAifRofiZioLSWT4UkrlZiePAudTqwZlEeScA0dYdY1YCKG1UIpjE6BRSAyA7z00kW8F4Fo6');


const ITEMS_PER_PAGE = 1;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts

    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'Products',
      path: 'products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page -1 ,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().countDocuments().then(numProducts => {
    totalItems = numProducts

    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page -1 ,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    console.log(err);
  });
};
  
    

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      let total = 0;

      products.forEach(p => {
        total += p.quantity * p.productId.price;
      })
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,

      });
    })
    .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const token = req.body.stripeToken; // Using Express
  let totalSum = 0;

  req.user
    .populate('cart.items.productId')
    .then(user => {
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      }); 

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order => {
    if(!order) {
      // return next(new Error('No order found'))
      console.log('No order found')
      res.redirect('/404')
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      // return next(new Error('Unauthorized'))
      console.log(err)
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', invoiceName);

    res.setHeader('Content-Type', 'application/pdf'); // open in browser
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"') // download

    pdfDoc = new PDFDocument();
    pdfDoc.pipe(fs.createWriteStream(invoiceName));
    pdfDoc.pipe(res)
    pdfDoc.fontSize(26).text('Invoice', {
      undeline: true
    });
    pdfDoc.text('-------------------------------------')

    let totalPrice = 0
    order.products.forEach(prod => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(
        prod.product.title +
        ' - ' +
        prod.quantity +
        ' - ' +
        ' ' + '@' + ' ' +
        '$' +
        prod.product.price +
        ' ' + '=' + ' ' + '$' +
        prod.quantity * prod.product.price
      )
    });
    pdfDoc.text('-----------------------')
    pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

    pdfDoc.end()

    // fs.readFile(invoicePath, (err, data) => {
    //   if(err) {
    //     console.log(err)
    //     // next(err)
    //   }
    //   // download file
    //   res.setHeader('Content-Type', 'application/pdf'); // open in browser
    //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"') // download
    //   res.send(data)
    // })
    

  }).catch(err => {
    // next(err)
    console.log(err)
  })
  
}


// const Product = require('../models/product');
// const Order = require('../models/order');
// const User = require('../models/user')

// exports.getProducts = (req, res, next) => {
//   Product.find().then(products => {
//     res.render('shop/product-list', {
//       prods: products,
//       pageTitle: 'All Products',
//       path: '/products',
//       isAuthenticated: req.isLoggedIn
//     })
//   }).catch(err => {
//     console.log(err)
//   })
// };

// exports.getProduct = (req, res, next) => {
//   const prodId = req.params.productId;
//   Product.findById(prodId)
//     .then(product => {
//       console.log(product)
//       res.render('shop/product-detail', {
//         product: product,
//         pageTitle: product.title,
//         path: '/products',
//         isAuthenticated: req.isLoggedIn
//       });
//     })
//     .catch(err => console.log(err));
// };
// exports.getIndex = (req, res, next) => {
//   Product.find()
//     .then(products => {
//       res.render('shop/index', {
//           prods: products,
//           pageTitle: 'Shop',
//           path: '/',
//           isAuthenticated: req.isLoggedIn
//         });
//       }).catch(err => {
//         console.log(err)
//       })
// };

// exports.getCart = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     // .execPopulate()
//     .then(user => {
//       const products = user.cart.items;
//       res.render('shop/cart', {
//         path: '/cart',
//         pageTitle: 'Your Cart',
//         products: products,
//         isAuthenticated: req.isLoggedIn
//       });
//     })
//     .catch(err => console.log(err));
// };

// exports.postCart = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId)
//     .then(product => {
//       return req.user.addToCart(product);
//     })
//     .then(result => {
//       res.redirect('/cart')
//       console.log(result);
//     });
//   // let fetchedCart;
//   // let newQuantity = 1;
//   // req.user
//   //   .getCart()
//   //   .then(cart => {
//   //     fetchedCart = cart;
//   //     return cart.getProducts({ where: { id: prodId } });
//   //   })
//   //   .then(products => {
//   //     let product;
//   //     if (products.length > 0) {
//   //       product = products[0];
//   //     }
//   //     // adding existing product
//   //     if (product) {
//   //       const oldQuantity = product.cartItem.quantity;
//   //       newQuantity = oldQuantity + 1;
//   //       return product;
//   //     }
//   //     return Product.findByPk(prodId);
//   //   })
//   //   .then(product => {
//   //     return fetchedCart.addProduct(product, {
//   //       through: { quantity: newQuantity }
//   //     });
//   //   })
//   //   .then(() => {
//   //     res.redirect('/cart');
//   //   })
//   //   .catch(err => console.log(err));
// };


// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user
//     .removeFromCart(prodId)
//     .then(result => {
//       res.redirect('/cart');
//     })
//     .catch(err => {
//       console.log(err)
//     });
// };

// exports.postOrder = (req, res, next) => {
//   req.user
//     .populate('cart.items.productId')
//     // .execPopulate()
//     .then(user => {
//       const products = user.cart.items.map(i => {
//         return { quantity: i.quantity, product: { ...i.productId._doc }}
//       });
//       const order = new Order({
//         user: {
//           name: req.user.name,
//           userId: req.user
//         },
//         products: products
//       })
//       return order.save();
//     }).then(result => {
//       // clear the cart
//       return req.user.clearCart()
//     })
//     .then(() => {
//       res.redirect('/orders');
//     })
//     .catch(err => console.log(err));
// };

// exports.getOrders = (req, res, next) => {
//   Order.find({ 'user.userId': req.user._id})
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders,
//         isAuthenticated: req.isLoggedIn
//       });
//     }).catch(err => { console.log(err) })
// };