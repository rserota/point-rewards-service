const axios = require('axios')
const baseUrl = 'http://localhost:8080'


beforeEach(async ()=>{
    await axios.delete(`${baseUrl}/points`)
})

describe('Transaction creation', ()=>{

    describe('with valid inputs', ()=>{
        it('should return a 201 response', async ()=>{
            const testTransaction = { "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }
            const postResponse = await axios.post(`${baseUrl}/points`, testTransaction)
            expect(postResponse.status).toBe(201)

            const getResponse = await axios.get(`${baseUrl}/points`)
            // console.log(getResponse.data)
        })
    })

    describe('with invalid inputs', ()=>{
        it('should return a 201 response', async ()=>{
            const response = await axios.post(`${baseUrl}/points`)
            // console.log('resp ', response)
        })
    })
})

describe('Balance calculation', ()=>{
    describe('with valid inputs', ()=>{
        it('should return the balance', async ()=>{
            await Promise.all([
                axios.post(`${baseUrl}/points`,{ "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" })
            ])

            const response = await axios.get(`${baseUrl}/points/balance`)
            expect(response.data).toEqual({ DANNON: 1100, UNILEVER: 200, 'MILLER COORS': 10000 })

        })
    })
})

describe('Spending points', ()=>{
    describe('with valid inputs', ()=>{
        it('should return the list of payers whose points were spent', async ()=>{
            const getResponse = await axios.get(`${baseUrl}/points/balance`)
            console.log(getResponse.data)
            await Promise.all([
                axios.post(`${baseUrl}/points`,{ "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" }),
            ])

            const spendResponse = await axios.post(`${baseUrl}/points/spend`, {points: 5000})
            console.log('spend response', spendResponse)
        })
    })
})