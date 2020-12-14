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
    const hotspotStates =await connection.aggregate([{$project:{
        _id:false,
        state:"$state",
        rate:{
            $round:[
                {
                    $divide:[
                        {$subtract:["$infected","$recovered"]},"$infected"]},5]}}},{$match:{rate:{$gt:0.1}}}]);
    res.send({data:hotspotStates});
});
app.get("/healthyStates",async(req,res)=>{
    const healthyStates = await connection.aggregate([{$project:{
        _id:false,
        state:"$state",
        mortality:{
            $round:[
                {
                    $divide:["$death","$infected"]
                },5]}}},{$match:{mortality:{$lt:0.005}}}]);
    res.send({data:healthyStates});
});

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;