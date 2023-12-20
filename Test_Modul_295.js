/**
 *
 * Autor: Janne
 * Date: 20.12.2023
 * This code can use Authenticator to access a self-made library that contains
 * tasks that you have to do.
 *
 */

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const crypto = require('crypto');

const logindata = {
  benutzername: "Janne",
  password: "Test1234",
};

let isAuthenticated = false;

const generateRandomToken = () => {
  return crypto.randomBytes(10).toString("hex");
};

app.use(bodyParser.json());

// Parser für JSON-Daten
app.use(express.json());

let tasks = [
  { id: 1, description: "Task 1", status: "todo" },
  { id: 2, description: "Task 2", status: "in-progress" },
];

const checklogindata = (req, res, next) => {
    if (logindata) {
      next();
    } else {
      res.status(403).json({ message: 'You are Unauthorized' });
    }
  };

// GET /tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const newTask = req.body;

  newTask.id = tasks.length + 1;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// GET /tasks/{id}
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const foundTask = tasks.find((task) => task.id === taskId);

  if (foundTask) {
    res.status(200).json(foundTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// PUT /tasks/{id}
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const updatedTask = req.body;

  const index = tasks.findIndex((task) => task.id === taskId);

  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updatedTask };
    res.status(200).json(tasks[index]);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// DELETE /tasks/{id}
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const deletedTaskIndex = tasks.findIndex((task) => task.id === taskId);

  if (deletedTaskIndex !== -1) {
    const deletedTask = tasks.splice(deletedTaskIndex, 1)[0];
    res.status(200).json(deletedTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Funktion zur Überprüfung des Tokens
const checkTokenValidity = (req, res, next) => {
    const token = req.headers.authorization; // Du solltest den Token aus dem Authorization-Header oder einem anderen sicheren Ort erhalten
  
    // Überprüfe, ob der Token gültig ist (ersetze dies durch deine eigene Logik)
    if (isValidToken(token)) {
      next(); // Token ist gültig, fahre fort
    } else {
      res.status(401).json({ message: 'Invalid token' }); // Token ist ungültig
    }
  };
  
  // Beispiel-Funktion zur Überprüfung der Token-Gültigkeit (ersetze dies durch deine eigene Logik)
  const isValidToken = (token) => {
    // Hier solltest du deine eigene Logik zur Überprüfung des Tokens implementieren
    // Zum Beispiel, vergleiche den Token mit den in deiner Anwendung gespeicherten gültigen Tokens
    // Rückgabe true, wenn der Token gültig ist, ansonsten false
    return validTokens.includes(token);
  };
  
  // Annahme: validTokens ist ein Array, das gültige Tokens speichert
  const validTokens = [];
  
  // POST /login
  app.post('/logins', (req, res) => {
    const { benutzername, password } = req.body;
  
    if (benutzername === logindata.benutzername && password === logindata.password) {
      const token = generateRandomToken();
      validTokens.push(token); // Füge den generierten Token zu den gültigen Tokens hinzu
      res.status(200).json({ message: "Your token is:", token });
    } else {
      res.status(401).json({ message: "Your login details are incorrect" });
    }
  });
  
  // GET /verify
  app.get('/verifys', checkTokenValidity, (req, res) => {
    res.status(200).json({ message: 'Your Token is valid' });
  });
  
  // DELETE /logout
  app.delete('/logouts', (req, res) => {
    const token = req.headers.authorization; // Hole den Token aus dem Authorization-Header
    validTokens = validTokens.filter((t) => t !== token); // Entferne den Token aus den gültigen Tokens
    res.status(204).send();
  });
  
  // Check if the Cookie is valid
  app.get('/valides', checkTokenValidity, (req, res) => {
    res.status(200).json({ message: 'Authenticated request' });
  });

// Output Port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
