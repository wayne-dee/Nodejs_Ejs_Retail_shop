const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');


//rendering template engine
// using EJS
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
// serving static files to access file system
app.use(express.static(path.join((__dirname, 'public'))));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// sync JS definition to the database
sequelize.sync().then(result => {
    // console.log(result)
    app.listen(3000);
}).catch(err => {
    console.log(err)
})


