const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

app.get("/totalRecovered",async(req,res)=>{
    const recoverdTotal=await connection.aggregate([{$group:{_id: "total", recovered: {$sum: "$recovered"}}}]);
    res.send({data: recoverdTotal[0]});
});

app.get("/totalActive",async(req,res)=>{
    const totalActive = await connection.aggregate([{$group:{_id:"total",active:{$sum: "$infected"}}}]);
    res.send({data: totalActive[0]});
});
app.get("/totalDeath",async(req,res)=>{
    const totalDeath = await connection.aggregate([{$group:{_id:"total",death:{$sum:"$death"}}}]);
    res.send({data:totalDeath[0]});
});
app.get("/hotspotStates",async(req,res)=>{
    const allData=await connection.find();
    let hostspot=0;
    let myres=[];
    allData.forEach((data)=>{
        hotspot=((data.infected - data.recovered)/data.infected)
        hotspot = Math.round(hotspot*100000)/100000;
        if(hotspot>0.1)
            myres.push({state: data.state, rate: hotspot});  
    }

    );
    res.send({data:myres});
});


app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;