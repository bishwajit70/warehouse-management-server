const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const app = express()
require('dotenv').config()

const port = process.env.PORT || 5000

// middlewear 
app.use(cors())
app.use(express.json())

// connection to mongodb 
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.2jdxh.mongodb.net:27017,cluster0-shard-00-01.2jdxh.mongodb.net:27017,cluster0-shard-00-02.2jdxh.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7ndns6-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// root endpoint 
app.get('/', (req, res) => {
    res.send('Hello Warehouse Management')
})

async function run() {
    try {
        await client.connect();
        const inventoryCollection = client.db("inventoryCollection").collection("inventory");

        // POST Events : add a new Inventory Item
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            console.log('Adding New inventory Item', newInventory);
            const result = await inventoryCollection.insertOne(newInventory);
            console.log(result);
            res.send(result)
        })


        //get all Inventory Item
        app.get('/inventory', async (req, res) => {
            const query = {}
            const cursor = inventoryCollection.find(query);
            const inventories = await cursor.toArray()
            res.send(inventories)
        })


        // delete an invetory item 
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        })


        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.findOne(query)
            res.send(result);
        })

        // Specific inventoryitem Update
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const updatedQuantity = req.body;
            console.log(updatedQuantity)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity.quantity,
                },
            };
            const result = await inventoryCollection.updateOne(filter, updatedDoc, options);
            res.send(result);

        })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)











// console of the app 
app.listen(port, () => {
    console.log('Listening Port ', port)
})


