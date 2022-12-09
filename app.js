const express = require('express')
const app = express()
app.use(express.json())
const points = []
const {getBalance, getTotalPoints} = require('./utils')



app.post('/points', (req, res)=>{
    if ( typeof req.body.points !== 'number' ) {
        res.status(422).send({error: "Points must be a positive number."})
    }
    else if ( (getBalance(points)[req.body.payer] || 0) + req.body.points < 0 ) {
        res.status(409).send({error: "Cannot accept transactions that result in a negative balance for a payer."})
    }
    else {
        points.push({
            ...req.body,
            remainingPoints: req.body.points,
        })
        res.status(201).send()
    }
})

// for setup before tests
app.delete('/points', (req, res)=>{
    points.length = 0
    res.status(204).send()
})

// for test assertions
app.get('/points', (req, res)=>{
    res.send(points)
})

app.get('/points/balance', (req, res)=>{
    const balance = getBalance(points)
    res.send(balance)
})

app.post('/points/spend', (req, res)=>{
    let requestedSpendAmount = req.body.points    
    const totalPoints = getTotalPoints(points)
    if ( requestedSpendAmount > totalPoints ) {
        res.status(409).send({error: "Cannot spend more than the total account balance."})
    }
    else { // they have enough points
        // points must be sorted by timestamp so that they're spent in the correct order
        points.sort((a,b)=>{
            if ( a.timestamp > b.timestamp ) { return 1 }
            else if ( a.timestamp < b.timestamp ) { return -1 }
            else { return 0 }
        })

        const balance = getBalance(points)
        const payers = {}
        for ( let transaction of points ) {
            let spentAmount
            // this transaction does not have enough points to satisfy the request
            if ( transaction.remainingPoints < requestedSpendAmount ) {
                
                // this payer has enough points to use this entire transaction (not too many negative transactions later)
                if ( balance[transaction.payer] >= transaction.remainingPoints ) {
                    spentAmount = transaction.remainingPoints
                    requestedSpendAmount -= spentAmount
                    balance[transaction.payer] -= spentAmount
                    transaction.remainingPoints = 0
                }
                else {
                    spentAmount = balance[transaction.payer]
                    requestedSpendAmount -= spentAmount
                    balance[transaction.payer] -= spentAmount
                    transaction.remainingPoints -= spentAmount
                }
            }
            // this is the last transaction we'll take points from to satisfy the request
            else if ( transaction.remainingPoints > requestedSpendAmount ) {
                spentAmount = requestedSpendAmount
                transaction.remainingPoints -= spentAmount
                requestedSpendAmount = 0
            }

            if ( spentAmount ) {
                if ( !payers[transaction.payer] ) {
                    payers[transaction.payer] = {payer: transaction.payer, points: -spentAmount}
                }
                else { payers[transaction.payer].points -= spentAmount }
            }
        }

        const output = Object.values(payers).sort((a,b)=>{ return a.points - b.points })
        res.send(output)
    }
})

app.listen(8080, ()=>{
    console.log("\nThe application is running on port 8080.")
})