const express = require('express')
const app = express()
const port = 3000
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

var dateTime = require('node-datetime');

app.use(bodyParser.json());

let userDb = [];
let itemDb = [];

// conffataa ohjelma herokun varalle!!!
app.set('port', (process.env.PORT || 80));


passport.use(new BasicStrategy(
    (username, password, done) => {
        console.log('Basic strategy params, username ' + username + " , password " + password);

        const searchResult = userDb.find(user => {
            if(user.username === username){
                if(bcrypt.compareSync(password, user.password)) {
                    return true;
                }
            }
        return false;
        })     
        //const searchResult = userDb.find(user => ({(username === user.username) && (password === user.password)))
        
        if(searchResult != undefined) {
            done(null, {}); 
        }else {
            done(null, false);
        }
    }
));

app.get('/', (req, res) => {
  res.send('Hellou World! Tai sitten sinä joka tätä luet ja alat tsiikailee mitä tämä jäbä on tehnyt, ei muutaku onnia yritykselle :)')
})

app.get('/protectedResource', passport.authenticate('basic', { session: false}),(req, res) =>{
    res.send("Tämä ei ole sinun kotisi vai mita!")

})

app.post('/signup', (req, res) => {

    const salt = bcrypt.genSaltSync(6)
    const hashedPassword = bcrypt.hashSync(req.body.password, salt)

    const newUser = {
     username: req.body.username,
     password: hashedPassword,
     email: req.body.email,
 }
 userDb.push(newUser);
 res.sendStatus(201);
})

app.get('/users', (req, res) => {

    res.json(userDb);
})

app.post('/items', passport.authenticate('basic', { session: false}),(req, res) => {

    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    String(formatted);

    const newItem = {
        id: uuidv4(),
        title: req.body.title,
        Description: req.body.description,
        Category: req.body.category,
        Address: req.body.Address,
        PostalCode: req.body.postalCode,
        Asking_Price: req.body.Asking_Price,
        Date_of_Posting: formatted,
        Delivery_Type: req.body.Delivery_Type,
        Sellers_Info: req.body.Sellers_Info,
    }
    itemDb.push(newItem);
    res.sendStatus(201);
    res.send("Uusi itemi on luotu!")
})

app.delete('/items/:id', passport.authenticate('basic', { session: false}), (req, res) => {
	var index = itemDb.indexOf(req.id);

	if (index === undefined) {
		res.sendStatus(404);
	} else {
		itemDb.splice(index, 1);
		res.send("Se on poistettu!!");
	}

})

app.put('/items/', passport.authenticate('basic', { session: false}), (req, res) => {
    var index = itemDb.findIndex((obj => obj.id == req.body.id));

    if (index === undefined) {
        res.send("toiminta")
        //res.sendStatus(404);
    } else {
        itemDb[index].title = req.body.title;

        res.send(req.body.id + index);
    }

})


app.get('/items', (req, res) => {

    res.json(itemDb);
})

app.get('/items/:id', (req, res) => {
    const item = itemDb.find(d => d.id === req.params.id);
    if (item === undefined) {
        res.sendStatus(404);
    } else {
        res.json(item);
    }
})

app.get('/items/:category', (req, res) => {
    const item = itemDb.find(d => d.category === req.params.category);
    if (item === undefined) {
        res.sendStatus(404);
    } else {
        res.json(item);
    }
})

app.get('/items/:location', (req, res) => {
    const item = itemDb.find(d => d.PostalCode === req.params.location);
    if (item === undefined) {
        res.sendStatus(404);
    } else {
        res.json(item);
    }
})

app.get('/items/:Date_of_Posting', (req, res) => {
    const item = itemDb.find(d => d.Date_of_Posting === req.params.Date_of_Posting);
    if (item === undefined) {
        res.sendStatus(404);
    } else {
        res.json(item);
    }
})

app.listen(app.get('port'), function() {
  console.log('APP is running on port', app.get('port'));
});
