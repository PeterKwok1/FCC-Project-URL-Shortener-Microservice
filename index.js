require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb')
const dns = require('dns')
const urlparser = require('url')
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// my code
// https://youtu.be/VP_FOwmGH44?t=735 
const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db("urlshortner")
const urls = db.collection("urls") // we are only using mongodb, not mongoose, due to this project's simplicity. for clarification, mongoose is built on top of mongodb. 

app.use('/api', bodyParser.urlencoded({ extended: true }))

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" })
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  })
})
