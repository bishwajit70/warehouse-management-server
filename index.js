const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express()

const port = process.env.PORT || 5000

// middlewear 
app.use(cors())
app.use(express.json())

// connection to mongodb 
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.2jdxh.mongodb.net:27017,cluster0-shard-00-01.2jdxh.mongodb.net:27017,cluster0-shard-00-02.2jdxh.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7ndns6-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const verifyJWT = (req, res, next) => {
    const accessToken = req.headers.accesstoken
    const token = accessToken.split(' ')[1]
    if (!accessToken) {
        res.status(401).send({ message: "Unautorized Access" })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next()
    })


}

// root endpoint 
app.get('/', (req, res) => {
    res.send('Hello Warehouse Management')
})

async function run() {

    try {
        await client.connect();
        const inventoryCollection = client.db("inventoryCollection").collection("inventory");
        const infoCollection = client.db("inventoryCollection").collection("ContactInfo");


        app.post('/login', (req, res) => {
            const user = req.body;
            console.log(user);
            const result = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ result });
        })

        // POST Inventory Item : add a new Inventory Item
        app.post('/inventory', async (req, res) => {
            const newInventory = req.body;
            // const email = req.body;
            // const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            // console.log(email);
            console.log('Adding New inventory Item', newInventory);
            const result = await inventoryCollection.insertOne(newInventory);
            console.log(result);
            res.send(result)
        })

        // POST Contact Info : add a new Contact Info 
        app.post('/contactinfo', async (req, res) => {
            const contactInfo = req.body;
            console.log('Adding New Contact Info Item', contactInfo);
            const result = await infoCollection.insertOne(contactInfo);
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

        // get my all my items 
        app.get('/myitem', verifyJWT, async (req, res) => {
            const decoded = req.decoded

            const email = req.query.email

            if (email === decoded?.email) {
                const query = { email: email }
                const cursor = inventoryCollection.find(query)
                const myItems = await cursor.toArray()
                res.send(myItems)
            }


        })

        // delete  my item 
        app.delete('/myitem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
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
            const newProduct = req.body;
            console.log(newProduct.sold)
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: newProduct.quantity,
                    sold: newProduct.sold
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


