const express = require('express');
const bp = require('body-parser');
const app = express()
app.set('view engine', 'ejs')

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/', function(require,res){
    res.render('home')
});

app.use(bp.urlencoded({ extended: true }));
