const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
//Middleware
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.zi72aqo.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const usersCollection = client.db("College_Boking").collection("users");
        const collegeCollection = client.db("College_Boking").collection("college_list");
        const admitionCollection = client.db("College_Boking").collection("admition_list");
        const paperCollection = client.db("College_Boking").collection("researchPapers");
        ////////////
        app.get('/', (req, res) => {
            res.send('Welcome to college book!')
        })
        ///get user info//
        app.get('/user', async (req, res) => {
            const email = req.query.email
            console.log('gggg')
            const query = { email }
            const result = await usersCollection.findOne(query)
            res.send(result)
        })

        ///Store New User
        app.post('/user', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.patch('/user', async (req, res) => {
            const email = req.query.email
            const data = req.body
            console.log('hit')
            console.log(email, data)
            const query = { email: email }
            const updateDoc = {
                $set: {
                    name: data.name,
                    email: data.email,
                    address: data.address,
                    university: data.university,
                    photo: data.photo
                },
            }
            const result = await usersCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        ////all colleges get/////
        app.get('/allcollege', async (req, res) => {
            console.log(req.query?.data)
            if (req.query?.data) {
                query = {
                    c_name: { $regex: req.query.data, $options: 'i' }
                }
                const result = await collegeCollection.find(query).toArray()
                return res.send(result)
            }
            else if (req.query?.data2) {
                query = {
                    status: req.query.data2
                }
                const result = await collegeCollection.find(query).toArray()
                return res.send(result)
            }
            else if (req.query?.id) {
                query = {
                   _id:new ObjectId( req.query.id)
                }
                const result = await collegeCollection.findOne(query)
                return res.send(result)
            }
            else {
                const result = await collegeCollection.find().toArray()
                return res.send(result)
            }
        })

        ////top 3 colleges get/////
        app.get('/topcollege', async (req, res) => {
            console.log('double hit')
            const result = await collegeCollection.find().sort({ ratting: -1 }).limit(3).toArray()
            res.send(result)
        })

        ///single college details///
        app.get('/allcollege/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const result = await collegeCollection.findOne(query)
            res.send(result)
        })
        ///Add Admition data///
        app.post('/admition', async (req, res) => {
            const data = req.body;
            const query = { student_email: data.student_email,college_name:data.college_name }
            const existingAdmition = await admitionCollection.findOne(query);

            if (existingAdmition) {
                return res.send({ message: 'user already exists' })
            }

            const result = await admitionCollection.insertOne(data);
            res.send(result);

        })

        ///get admition data by email//
        app.get('/admition', async (req, res) => {
            const query = { student_email: req.query.email };
            const result = await admitionCollection.find(query).toArray();
          
            const collegeIds = result.map((item) => new ObjectId(item.college_id));
            const query2 = { _id: { $in: collegeIds } };
            const result2 = await collegeCollection.find(query2).toArray();
      
            res.send(result2);
          })

          ////papers get///
          app.get('/papers', async (req, res) => {
            const result=await paperCollection.find().toArray()
            res.send(result)
          })


        //////////
        app.listen(port, () => {
            console.log(`Capture Camp app listening on port ${port}`)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);












