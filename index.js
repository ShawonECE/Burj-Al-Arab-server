const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 4000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const admin = require("firebase-admin");

const serviceAccount = require("./burj-al-arab-fire1-firebase-adminsdk-1i0ij-34c75f05eb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5yhhqym.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


app.get('/bookings', async(req, res) => {
    const bearer = await req.headers.authorization;
    //let idToken;
    let userEmail;
    if (bearer && bearer.startsWith('Bearer ')) {
        const idToken = bearer.split(' ')[1];
        admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            if (tokenEmail === req.query.email) {
                userEmail = tokenEmail;
            }
        })
        .catch((error) => {
            
        });
    };
    try {
        // Connect the client to the server	(optional starting in v4.7)
        
        await client.connect();
        
        const db = client.db("booking");
        const coll = db.collection("rooms");
    
            
        const result = await coll.find({email:userEmail}).toArray();
        
        res.send(result);
      } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
})

app.post('/addBooking', async(req, res) =>{
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      
      const db = client.db("booking");
      const coll = db.collection("rooms");
      const newBooking = req.body;
      //console.log(newBooking);
      const result = await coll.insertOne(newBooking);
      //console.log(result);
      res.send(result.acknowledged);
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
  }});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})