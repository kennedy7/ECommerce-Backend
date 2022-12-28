const express = require ("express")
const cors = require ("cors")
const app = express()
const PORT = process.env.PORT || 5000 

app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.send("Welcome to the backend homepage")
})
app.listen(PORT, ()=>{
    console.log(`Ecommerce backend running on port ${PORT} `)
})