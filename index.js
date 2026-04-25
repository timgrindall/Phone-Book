const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

// no more hardcoded persons var!

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => {
        console.log(error)
        next(error)
    })
})

app.get('/info', (request, response, next) => {
    Person.find({}).then(persons => {
        let numPersons = persons.length
        let datetime = new Date()

        console.log(persons.length + " persons")
        response.send(`<p>Phone Book has info for ${numPersons} people</p><p>${datetime}</p>`)
    }).catch(error => {
        console.log(error)
        next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    let id = request.params.id
    Person.findById(id).then(person => {
        console.log(person)
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    let id = request.params.id
    
    Person.findByIdAndDelete(id).then(result => {
        console.log(result)
        if (result) {
            response.status(204).end()
        } else {
            response.status(400).send({error: "ID not found"})
        }
    }).catch(error => {
        console.log(error)
        // response.status(400).send({error: "Doc not found"})
        next(error)
    })
})

// const MAX_INT = 1000

// function getRandomInt(max) {
//   return Math.floor(Math.random() * max);
// }

app.post('/api/persons', (request, response, next) => {
    // const id = getRandomInt(MAX_INT)
    const body = request.body

    if (!body.name || !body.number) {
        console.log("Error: Missing info")
        return response.status(400).json({error: "name or number missing"})
    }

    Person.find({}).then(persons => {
        if (persons.filter((p) => p.name === body.name)[0]) {
            console.log("duplicate name found: " + body.name)
            return response.status(409).json({error: "name must be unique"})
        } else {
            const person = new Person({
                name: body.name,
                number: body.number
            })
            
            //add person to the database
            person.save().then(savedPerson => {
                response.json(savedPerson)
            }).catch(error => {
                // console.log(error)
                next(error)
            })
        }
    }).catch(error => {
        console.log(error)
        next(error)
    })

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id
    console.log(body)

    Person.findByIdAndUpdate(id, body, {returnDocument: 'after'}).then((updatedPerson) => {
        console.log(updatedPerson)
        if (updatedPerson) {
            response.json(updatedPerson)
        } else {
            response.status(404).json({error: 'Person not found'})
        }
    }).catch(error => {
        console.log("ID not found!")
        // response.status(404).json({error: 'malformatted ID'})
        next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id - message' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})