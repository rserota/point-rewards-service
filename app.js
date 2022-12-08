const express = require('express');
const app = express();
app.use(express.json())
const transactions = [];


app.post('/transactions', (req, res)=>{
    console.log('body', req.body);
    transactions.push(req.body);

    res.status(201).send();
})

// for setup before tests
app.delete('/transactions', (req, res)=>{
    transactions.length = 0;
    res.status(204).send();
})

app.get('/transactions', (req, res)=>{
    console.log('transactions? ', transactions)
    res.send(transactions)
})

app.listen(8080, ()=>{
    console.log("\nThe application is running on port 8080.")
})