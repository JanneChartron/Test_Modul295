const express = require ('express')
const bodyParser = require ('body-parser')

const app = express
const port = 3000

app.use(bodyParser.json());

let car = [
    { id: 1, title: 'Mercedes', color: 'Blue' },
    { id: 2, title: 'Task 2', description: 'Description 2' },
        // ... weitere Aufgaben
]

//Get
app.get('/cars', (req, res) => {
    res.status(200).json(car);
  });

//Post
app.post('/cars'), (req, res) => {
    const newcar = req.body;
    newcar.id = car.length + 1;
    
}