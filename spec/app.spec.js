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
            expect(getResponse.data[0].points).toBe(300)
        })
    })

    describe('with invalid inputs', ()=>{
        it("should return a 422 response if the request doesn't have points", async ()=>{
            try {
                await axios.post(`${baseUrl}/points`)
                throw Error('This request should have failed')
            }
            catch(e){
                expect(e.response?.data).toEqual({error: 'Points must be a positive number.'})
                expect(e.response?.status).toBe(422)
            }
        })
        it("should return a 409 response if the request would result in a negative balance for a payer.", async ()=>{
            try {
                await Promise.all([
                    axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" }),
                    axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T16:00:00Z" }),
                    axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T17:00:00Z" }),
                ])
                throw Error('This request should have failed')
            }
            catch(e){
                expect(e.response?.data).toEqual({error: 'Cannot accept transactions that result in a negative balance for a payer.'})
                expect(e.response?.status).toBe(409)
            }
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
            await Promise.all([
                axios.post(`${baseUrl}/points`,{ "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" }),
                axios.post(`${baseUrl}/points`, { "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" }),
            ])

            const spendResponse = await axios.post(`${baseUrl}/points/spend`, {points: 5000})
            expect(spendResponse.data).toEqual([
                { payer: 'MILLER COORS', points: -4700 },
                { payer: 'UNILEVER', points: -200 },
                { payer: 'DANNON', points: -100 }
            ])

            const balanceResponse = await axios.get(`${baseUrl}/points/balance`)
            expect(balanceResponse.data).toEqual({ DANNON: 1000, UNILEVER: 0, 'MILLER COORS': 5300 })
        })
    })
    describe('with invalid inputs', ()=>{
        it('should not allow spending more than the account balance', async ()=>{
            try {
                await axios.post(`${baseUrl}/points/spend`, {points: 5000})
            }
            catch(e){
                expect(e.response?.data).toEqual({error: 'Cannot spend more than the total account balance.'})
                expect(e.response?.status).toBe(409)
            }
        })
    })
})