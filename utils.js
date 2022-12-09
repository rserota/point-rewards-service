const getBalance = (points)=>{
    const balance = { }
    for ( let transaction of points ) {
        if ( !balance[transaction.payer] )  {
            balance[transaction.payer] = transaction.remainingPoints
        }
        else {
            balance[transaction.payer] += transaction.remainingPoints
        }
    }

    return balance
}

const getTotalPoints = (points)=>{
    let totalPoints = 0
    const balance = getBalance(points)
    for (let payer in balance){ totalPoints += balance[payer] }
    return totalPoints
}

module.exports = {
    getBalance,
    getTotalPoints,
}