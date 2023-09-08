require('dotenv').config();
console.log(process.env);
const express = require("express");
const bodyParser = require("body-parser");
const encrpyt = require('mongoose-encryption');
const app = express();
const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });
const port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrpyt, {secret: process.env.SECRET, encryptedFields: ['password']});
const User = conn.model('user', userSchema)

app.get('/', (req, res) => {
    res.render('home');
});

app.route('/register')
    .get((req, res) => {
        res.render('register');
    })
    .post((req, res) => {
        const item = new User({
            email: req.body.username,
            password: req.body.password
        })
        item.save()
            .then(() => {
                res.render('secrets');
            });
    });
app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const email = req.body.username;
        const password = req.body.password;
        (async function () {
            try {
                const data = await User.find({ email: email }).exec();
                console.log('Fetched: ', data);
                if (data[0].password === password) {
                    res.render('secrets');
                }
                // res.send(data.password);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        })();
    })
app.listen(port, () => console.log(`Example app listening on port ${port}!`))