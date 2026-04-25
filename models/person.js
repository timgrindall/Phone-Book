require('dotenv').config()
// console.log("ENV:", process.env.MONGODB_URI)

const mongoose = require('mongoose')


if (!process.env.MONGODB_URI) {
    console.log("No MONGO_URI ENV variable!")
    process.exit(1)
}

const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 5,
    required: true
  },
  number: {
    type: String,
    minLength: 10,
    required: true
  },
  id: String
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)