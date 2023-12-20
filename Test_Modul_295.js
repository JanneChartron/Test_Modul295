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

app.use(bodyParser.json());

// Parser für JSON-Daten
app.use(express.json());

// Array zum Speichern gültiger Tokens
let validTokens = [];

// Funktion zur Generierung eines zufälligen Tokens
const generateRandomToken = () => {
  return crypto.randomBytes(10).toString('hex'); // Beispiel: 10 Bytes entsprechen 20 hexadezimalen Zeichen
};

// Middleware zur Überprüfung des Tokens
const checkTokenValidity = (req, res, next) => {
  const token = req.headers.authorization; // Hole den Token aus dem Authorization-Header

  if (isValidToken(token)) {
    next(); // Wenn der Token gültig ist, setze die Anfrage fort
  } else {
    res.status(401).json({ message: 'Invalid token' }); // Wenn der Token ungültig ist, sende einen Fehlerstatus
  }
};

// Funktion zur Überprüfung der Token-Gültigkeit
const isValidToken = (token) => {
  return validTokens.includes(token);
};

// Funktion zum Hinzufügen eines gültigen Tokens
const addValidToken = (token) => {
  validTokens.push(token);
};

// Funktion zum Entfernen eines gültigen Tokens
const removeValidToken = (token) => {
  const index = validTokens.indexOf(token);
  if (index !== -1) {
    validTokens.splice(index, 1);
  }
};

// POST /login
app.post('/logins', (req, res) => {
  const { benutzername, password } = req.body;

  if (benutzername === logindata.benutzername && password === logindata.password) {
    const token = generateRandomToken();
    addValidToken(token); // Füge den generierten Token zu den gültigen Tokens hinzu
    res.status(200).json({ message: 'Your token is:', token });
  } else {
    res.status(401).json({ message: 'Your login details are incorrect' });
  }
});

// GET /verify
app.get('/verifys', checkTokenValidity, (req, res) => {
  res.status(200).json({ message: 'Your Token is valid' });
});

// DELETE /logout
app.delete('/logouts', checkTokenValidity, (req, res) => {
  const token = req.headers.authorization; // Hole den Token aus dem Authorization-Header
  removeValidToken(token); // Entferne den Token aus den gültigen Tokens
  res.status(204).send();
});

// Check if the Cookie is valid
app.get('/valides', checkTokenValidity, (req, res) => {
  res.status(200).json({ message: 'Authenticated request' });
});

const tasks = [
    { id: 1, description: "Task 1", status: "todo" },
    { id: 2, description: "Task 2", status: "in-progress" },
  ];

// GET /tasks
app.get("/tasks", checkTokenValidity, (req, res) => {
  res.status(200).json(tasks);
});

// POST /tasks
app.post("/tasks", checkTokenValidity, (req, res) => {
  const newTask = req.body;

  newTask.id = tasks.length + 1;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// GET /tasks/{id}
app.get("/tasks/:id", checkTokenValidity, (req, res) => {
  const taskId = parseInt(req.params.id);
  const foundTask = tasks.find((task) => task.id === taskId);

  if (foundTask) {
    res.status(200).json(foundTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// PUT /tasks/{id}
app.put("/tasks/:id", checkTokenValidity, (req, res) => {
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
app.delete("/tasks/:id", checkTokenValidity, (req, res) => {
  const taskId = parseInt(req.params.id);
  const deletedTaskIndex = tasks.findIndex((task) => task.id === taskId);

  if (deletedTaskIndex !== -1) {
    const deletedTask = tasks.splice(deletedTaskIndex, 1)[0];
    res.status(200).json(deletedTask);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// Output Port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
