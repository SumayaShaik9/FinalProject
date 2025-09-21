/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
require('dotenv').config(); 
const cors = require('cors');
const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
app.use(cors());  
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files
app.use(express.json());

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();

if (!global.db) {
  const dbFile = process.env.NODE_ENV === 'test' ? ':memory:' : './database.db';
  global.db = new sqlite3.Database(dbFile, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log(`Database connected: ${dbFile}`);
      global.db.run("PRAGMA foreign_keys=ON");
    }
  });
}

// Handle requests to the home page 
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
const authRoutes = require("./routes/auth");
const identitiesRoutes = require("./routes/identities");
const contextsRoutes = require("./routes/contexts");
const sociallinksRoutes = require("./routes/socialLinks");
const tagsRoutes = require("./routes/tags");
const systemtranslationRoutes = require("./routes/systemtranlation");

app.use('/users', usersRoutes);
app.use("/auth", authRoutes);
app.use("/identities", identitiesRoutes);
app.use("/contexts", contextsRoutes);
app.use("/sociallinks", sociallinksRoutes);
app.use("/tags", tagsRoutes);
app.use("/system", systemtranslationRoutes);


// // Make the web application listen for HTTP requests
// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  });
}

module.exports = app; // export app for tests