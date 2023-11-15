// bucket list app
// The app is supposed to 
// 1) allow user to add to bucket list 
// 2) allow the user to click complete on a bucket list item, and the item gets a line strike through
// 3) allow the user to delete a bucket list item

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient // mongo db is an entity that can hold a bunch of objects, documents

var db, collection;

const url = "mongodb+srv://rcbootcamp:test123@cluster0.beyvcmh.mongodb.net/bucket-list?retryWrites=true&w=majority";
const dbName = "bucket-list";

app.listen(1000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName); 
        collection = db.collection('bucketlist') // assigning collection to reference bucketlist 
        console.log("Connected to `" + dbName + "`! On port 1000");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  collection.find().toArray((err, result) => { 
    if (err) return console.log(err)
    res.render('index.ejs', {bucketlist: result}) 
    // The ejs template is going to make an li for each document that was in our collection
  })
})

app.post('/bucketlist', (req, res) => {
  console.log(req)
  collection.insertOne({
      item: req.body.item, 
      complete: false // init status of completed field
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('Item added to bucket list')
      // second instuction for post is to redirect (refresh page)
      res.redirect('/') 
    }
  )
})

// 'complete' field of bucket list item
app.put('/bucketlist/:id', (req, res) => {
  // extract id from URL parameter
  const itemId = req.params.id
  // extract 'complete' value / true or false
  const completed = req.body.complete === 'true'

  collection.findOneAndUpdate(
    { _id: new require('mongodb').ObjectId(itemId) }, // creating id to target, ObjectId is a MongoDB constructor function to create MongoDB ObjectIds
    { $set: {complete: completed} }, 
    { sort: {_id: -1} }, 
    (err, result) => {
      if (err) return res.send(err)
      res.send(result)
    }
  )
})

app.delete('/bucketlist/:id', (req, res) => {
  const itemId = req.params.id

  collection.findOneAndDelete(
    { _id: new require('mongodb').ObjectID(itemId) }, 
    (err, result) => {
    if (err) return res.send(500, err)
    res.send('Item deleted from bucket list!')
  })
})
