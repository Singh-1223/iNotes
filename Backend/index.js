const connectToMongo= require('./db');
const express = require('express');
const cors = require('cors');
const authpath = require('./routes/auth');
connectToMongo();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

//Available Routes
app.use('/api/auth',authpath);  // can wirte this way
app.use('/api/notes',require('./routes/notes'));// or can require here directly

app.listen(port,()=>{
    console.log(`iNotes backend listending at port http://localhost:${port}`)
}) 