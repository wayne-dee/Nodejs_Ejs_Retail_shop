const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
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
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
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
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });
};





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