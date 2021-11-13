const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

////////////////////////
app.use(cors());
app.use(express.json());
require("dotenv").config();

//////////////////////////

const { MongoClient } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mhwso.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// //////////////////////////////
async function run() {
  try {
    await client.connect();
    const database = client.db("carcity");
    //////////////////////
    const carsCollections = database.collection("cars");
    const orderCollections = database.collection("orders");
    const userCollections = database.collection("users");
    const reviewCollections = database.collection("reviews");

    // Get API
    app.get("/cars", async (req, res) => {
      const cursor = carsCollections.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });
    app.get("/carlimit", async (req, res) => {
      const cursor = carsCollections.find({});
      const cars = await cursor.limit(6).toArray();
      res.send(cars);
    });

    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const car = await carsCollections.findOne(query);
      res.send(car);
    });
    // get Orders
    app.get("/orders", async (req, res) => {
      const cursor = orderCollections.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const orders = await orderCollections.find(query).toArray();

      res.send(orders);
    });
    // get user
    app.get("/users", async (req, res) => {
      const cursor = userCollections.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    });
    //get Admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollections.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // Get Review
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollections.find({});
      const review = await cursor.toArray();
      res.send(review);
    });
    //////////
    //post API
    app.post("/cars", async (req, res) => {
      const newCar = req.body;

      const result = await carsCollections.insertOne(newCar);
      res.json(result);
    });
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollections.insertOne(newOrder);
      res.json(result);
    });
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollections.insertOne(newUser);
      res.json(result);
    });
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollections.insertOne(newReview);
      res.json(result);
    });

    ///Make Admin Api
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating");
      res.json(result);
    });
    /////// upDate Order
    app.put("/orders/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedUser.status,
        },
      };
      const result = await orderCollections.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(result);
    });
    //// Delete Order
    app.delete("/orders/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollections.deleteOne(query);

      res.json(result);
    });
    //////////
    // Delete Product / Car
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carsCollections.deleteOne(query);

      res.json(result);
    });
    //////////////////////
    console.log("conneted");
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

/////////////////////////////
app.get("/", (req, res) => {
  res.send("runnign my code2");
});

app.listen(port, () => {
  console.log("runnig", port);
});
