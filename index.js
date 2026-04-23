const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// no more hardcoded persons var

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    let numPersons = persons.length
    let datetime = new Date()

    console.log("persons.length(): " + persons.length)
    response.send(`<p>Phone Book has info for ${numPersons} people</p><p>${datetime}</p>`)
})

const getMaxId = () => {
    const maxId = persons.length > 0 ? Math.max(...persons.map(p => Number(p.id))) : 0
    return String(maxId)
}

app.get('/api/persons/:id', (request, response) => {
    let id = request.params.id
    let person = persons.filter( (p) => p.id === id )
    console.log(person)
    const maxId = getMaxId()

    if (id !== '0' && id <= maxId) {
        response.json(person)
    } else {
        console.log("Error: id was invalid (out of bounds)")
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    let id = request.params.id
    const maxId = getMaxId()
    
    if (id !== '0' && id <= maxId) {   // simply using length doesn't work when the id is higher
        deletedPerson = persons.filter((p) => p.id === id)
        persons = persons.filter((p) => p.id !== id)

        response.json(deletedPerson)
        //response.status(204).end()
    } else {
        console.log("Error: id was invalid (out of bounds)")
        response.status(400).end()
    }

})

const MAX_INT = 1000

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.post('/api/persons', (request, response) => {
    const id = getRandomInt(MAX_INT)
    const body = request.body

    if (!body.name || !body.number) {
        console.log("Error: Missing info")
        return response.status(400).json({error: "info missing"})
    }

    if (persons.filter((p) => p.name === body.name)[0]) {
        console.log("duplicate name found: " + body.name)
        return response.status(400).json({error: "name must be unique"})
    }

    newPerson = {
        "id": String(id),
        "name": body.name,
        "number": body.number
    }

    persons = persons.concat(newPerson)

    response.json(newPerson)
    // console.log(request.body)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})