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
app.set('views', './views'); 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/frontend'));
let init_val= '';

//routes

const runPythonScript = (parameter, callback) => {
  const pythonScriptPath = 'backend/IR_Model.py';
  const param = parameter;

  // Execute the Python script
  exec(`python3 ${pythonScriptPath} "${parameter}"`, (error, stdout, stderr) => {
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

app.get("/list", async (req, res) => {
  try {
    const jsonFilePath = './search_results.json';

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading JSON file: ${err.message}`);
        return;
      }
    
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    });

  } catch (error) {
    console.error(`Error reading or parsing JSON file: ${error.message}`);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/search", (req, res) => {
  init_val = req.query.query; // Get the query parameter from URL

  // Run the Python script with the query
  runPythonScript(init_val, (error) => {
    if (error) {
      res.status(500).send('Error executing Python script');
      return;
    }

    // After script execution, reload the view with updated data
    // Assuming the script modifies a file or data that the view will use
    res.redirect('/index'); // Redirect to the index route
  });
});

app.get("/index", (req, res) => {

  // Run the Python script and wait for completion
  runPythonScript(init_val, (error) => {
    if (error) {
      res.status(500).send('Error executing Python script');
    } else {
      // Send the HTML file after the Python script has completed
      res.render('index'); 
    }
  });
});

const port = process.env.PORT || 8888;

app.listen(port, () => {
  console.log(`Listening on Port, ${port}`)
})