const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const html = require('html');
const axios = require('axios');

const app = express()

app.use(cors())
app.use(morgan("coins"))
app.use(express.static(__dirname + '/frontend'));

//routes
app.get("/coins/coinmarketcap", (req, res) => {
  const url = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest";
  const options = {
    headers: {
      'X-CMC_PRO_API_KEY': '7a10b646-ea93-4ac8-9959-44a39fe7a432',
    }
  };
  fetch(url, options)
  .then((response) => response.json())
  .then((json) => res.json(json));
})

app.get("/coins/coinranking", (req, res) => {
  const url = "https://api.coinranking.com/v2/coins";
  const options = {
    headers: {
      'x-access-token': 'coinranking672661c748cf6e8a73e93872aaf77354ab8ffb456c4dd4a7',
    },
  };
  fetch(url, options)
  .then((response) => response.json())
  .then((json) => res.json(json));
})

app.get("/index", (req, res) => {
  res.sendFile("frontend/index.html", {root: __dirname});
})

const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log(`Listening on Port, ${port}`)
})