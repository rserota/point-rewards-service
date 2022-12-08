const express = require('express');
const app = express();
app.use(express.json())
const points = [];


app.post('/points', (req, res)=>{
    console.log('body', req.body);
    req.body.remainingPoints = req.body.points
    points.push(req.body);

    res.status(201).send();
})

// for setup before tests
app.delete('/points', (req, res)=>{
    points.length = 0;
    res.status(204).send();
})

// for test assertions
app.get('/points', (req, res)=>{
    res.send(points)
})

app.get('/points/balance', (req, res)=>{
    const balance = { }
    for ( let transaction of points ) {
        if ( !balance[transaction.payer] )  {
            balance[transaction.payer] = transaction.remainingPoints
        }
        else {
            balance[transaction.payer] += transaction.remainingPoints
        }
    }
    res.send(balance)
})

app.listen(8080, ()=>{
    console.log("\nThe application is running on port 8080.")
})