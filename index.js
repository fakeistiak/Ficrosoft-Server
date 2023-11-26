const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8c8ayj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const userCollection = client.db("ficrosoft").collection("users");
    const worksheetCollection = client.db("ficrosoft").collection("worksheet");

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //    for posting users into db

    app.post("/user", async (req, res) => {
      try {
        const result = await userCollection.insertOne(req.body);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    //  for getting all the users
    app.get("/user", async (req, res) => {
      try {
        const result = await userCollection.find().toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    //   for getting all the employees

    app.get("/employee", async (req, res) => {
      try {
        const result = await userCollection
          .find({ role: "employee" })
          .toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/details/:id", async (req, res) => {
      try {
        const result = await userCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // worksheet 
    app.post('/worksheet', async (req, res) => {
      const worksheet = req.body;
      console.log(worksheet); 
      const result = await worksheetCollection.insertOne(worksheet);
      res.send(result);
  
      

    });





  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
