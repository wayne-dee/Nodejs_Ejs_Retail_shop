const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars');

const app = express();

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

//rendering template engine
// using EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
// serving static files
app.use(express.static(path.join((__dirname, 'public'))));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'page not found'})
});

app.listen(3000);
