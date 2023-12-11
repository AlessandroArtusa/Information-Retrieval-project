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
app.get("/index", (req, res) => {
  res.sendFile("frontend/index.html", {root: __dirname});
})

const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log(`Listening on Port, ${port}`)
})