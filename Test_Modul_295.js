/**
 *
 * Author: Janne Chartron
 * Date: 20.12.23
 * This code can use Authenticator to access a self-made library that contains
 * tasks that you have to do.
 * 
 * The code was edited with Prettier.
 * 
 * The code was partly programmed with ChatGPT, but these parts were
 * well commented.
 *
 */

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const port = 3000;
const crypto = require("crypto");

const logindata = {
  username: "Janne",
  password: "Test1234",
};

app.use(bodyParser.json());

// JSON data parser is used to parse incoming requests with JSON
app.use(express.json());

// Array for storing valid tokens
let validTokens = [];

// Function to generate a random token
const generateRandomToken = () => {
    //crypto generates random bytes
    return crypto.randomBytes(10).toString("hex");
};

// Middleware for token validation
const checkTokenValidity = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.headers.authorization;

    if (isValidToken(token)) {
        next(); // If the token is valid, proceed with the request
    } else {
        // If the token is invalid, send an error status
        res.status(401).json({ message: "Invalid token" });
    }
};

// Function to check token validity
const isValidToken = (token) => {
    return validTokens.includes(token);
};

// Function to add a valid token
const addValidToken = (token) => {
    validTokens.push(token);
};

// Function to remove a valid token
const removeValidToken = (token) => {
    const index = validTokens.indexOf(token);
    if (index !== -1) {
        validTokens.splice(index, 1);
    }
};

// POST /login
app.post("/logins", (req, res) => {
    const { username, password } = req.body;

    if (
        username === logindata.username &&
        password === logindata.password
    ) {
        const token = generateRandomToken();
        // Add the generated token to the valid tokens
        addValidToken(token); 
        res.status(200).json({ message: "Your token is:", token });
    } else {
        res.status(401).json({ message: "Your login details are incorrect" });
  }
});

// GET /verify
app.get("/verifys", checkTokenValidity, (req, res) => {
    res.status(200).json({ message: "Your Token is valid" });
});

// DELETE /logout
app.delete("/logouts", checkTokenValidity, (req, res) => {
    // Get the token from the Authorization header
    const token = req.headers.authorization; 
    // Remove the token from the valid tokens
    removeValidToken(token); 
    res.status(204).send();
});

// Check if the Cookie is valid
app.get("/valides", checkTokenValidity, (req, res) => {
    res.status(200).json({ message: "Authenticated request" });
});

const tasks = [
    { id: 1, description: "Task 1", status: "todo" },
    { id: 2, description: "Task 2", status: "swimming" },
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
//I did this with ChatGPT
//The comments are for my own understanding
app.put("/tasks/:id", checkTokenValidity, (req, res) => {
    const taskId = parseInt(req.params.id);
    const updatedTask = req.body;

    //looks for an element in the tasks array whose id corresponds to the value
    //of taskId
    const index = tasks.findIndex((task) => task.id === taskId);

    //Application and are used to update a task in an array
    /**
     * The three dots before tasks and updatedTask are used to insert the 
     * elementsof an array or the properties of an object in one place in
     * the code.
     */
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

    /**
     * This checks whether the index (deletedTaskIndex) of the task to be 
     * deleted was found in the tasks array.
     */
    if (deletedTaskIndex !== -1) {
        const deletedTask = tasks.splice(deletedTaskIndex, 1)[0];
        res.status(200).json(deletedTask);
    } else {
        res.status(404).json({ error: "Task not found" });
    }
});


/**
 * This is so-called error handling middleware. It is called when there was 
 * an error in the previous middleware functions or route handlers.
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Output Port
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
