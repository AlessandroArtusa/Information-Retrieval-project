const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');
const html = require('html');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs-extra');
const readline = require('readline');

const app = express()

app.use(cors())
app.use(morgan("coins"))
app.use(express.static(__dirname + '/frontend'));

//routes

const runPythonScript = (callback) => {
  const pythonScriptPath = 'run_spiders.py';

  // Execute the Python script
  exec(`python ${pythonScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      callback(error);
      return;
    }

    // Process the output of the Python script
    console.log(`Output from Python script:\n${stdout}`);
    callback(null);
  });
};

const readJSONLines = async (filePath) => {
  const lines = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  const dataArray = [];

  for await (const line of lines) {
    try {
      const jsonData = JSON.parse(line);
      dataArray.push(jsonData);
    } catch (error) {
      console.error(`Error parsing JSON line: ${error.message}`);
    }
  }

  return dataArray;
};

app.get("/list", async (req, res) => {
  try {
    const jsonFilePath = './scraper_output.jsonl';

    // Read the content of the JSON file
    readJSONLines(jsonFilePath)
    .then((dataArray) => {
      res.json(dataArray);
    })
    .catch((error) => {
      console.error(`Error reading JSON Lines file: ${error.message}`);
    });

  } catch (error) {
    console.error(`Error reading or parsing JSON file: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/index", (req, res) => {

  // Run the Python script and wait for completion
  runPythonScript((error) => {
    if (error) {
      res.status(500).send('Error executing Python script');
    } else {
      // Send the HTML file after the Python script has completed
      res.sendFile('frontend/index.html', { root: __dirname });
    }
  });
});

const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log(`Listening on Port, ${port}`)
})