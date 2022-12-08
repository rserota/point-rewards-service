const axios = require('axios')
const baseUrl = 'http://localhost:8080'


describe('Transaction creation', ()=>{
    beforeAll(async ()=>{
        await axios.delete(`${baseUrl}/transactions`)
    })
    describe('with valid inputs', ()=>{
        it('should return a 201 response', async ()=>{
            const testTransaction = { "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }
            const postResponse = await axios.post(`${baseUrl}/transactions`, testTransaction)
            expect(postResponse.status).toBe(201)

            const getResponse = await axios.get(`${baseUrl}/transactions`)
            console.log(getResponse.data)
        })
    })
    describe('with invalid inputs', ()=>{
        it('should return a 201 response', async ()=>{
            const response = await axios.post(`${baseUrl}/transactions`)
            // console.log('resp ', response)
        })
    })
})