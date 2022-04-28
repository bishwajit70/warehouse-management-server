const express = require('express');
const cors = require('cors');
const app = express()

const port = process.env.PORT || 5000

// middlewear 
app.use(cors())
app.use(express.json())

// root endpoint 
app.get('/', (req, res) => {
    res.send('Hello Warehouse Management')
})

// console of the app 
app.listen(port, () => {
    console.log('Listening Port ', port)
})


