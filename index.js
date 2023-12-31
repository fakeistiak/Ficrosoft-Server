const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
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

    // jwt related

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // middleware

    const verifyToken = (req, res, next) => {
      console.log("inside verify token", req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden access" });
      }
      const token = req.headers.authorization.split("")[1];

      // next();
    };

    // users related api
    app.get("/users", verifyToken, async (req, res) => {
      console.log(req.headers);

      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "HR",
        },
      };
      const result = await userCollection.updateOne(query, updatedDoc);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

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
    // app.get("/user", async (req, res) => {
    //   try {
    //     const result = await userCollection.find().toArray();
    //     console.log(result);
    //     res.send(result);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });

    //  for getting all the users and single user --NEW
    app.get("/user", async (req, res) => {
      try {
        const email = req.query.email;
        if (email) {
          const query = { email };
          const result = await userCollection.findOne(query);
          return res.send(result);
        }
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
          .find({ role: "Employee" })
          .toArray();
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.patch("/employee/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);

        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: { isVerified: true },
        };

        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      };
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
    app.post("/worksheet", async (req, res) => {
      const worksheet = req.body;
      console.log(worksheet);
      const result = await worksheetCollection.insertOne(worksheet);
      res.send(result);
    });

    app.get("/worksheet", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await worksheetCollection.find(query).toArray();
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
