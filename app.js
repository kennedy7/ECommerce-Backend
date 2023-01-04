const express = require ("express")
const cors = require ("cors")
const app = express()
const PORT = process.env.PORT || 5000 
const products = require("./products")

app.use(express.json())
app.use(cors())

app.get('/', (req, res)=>{
    res.send("Welcome to the backend homepage")
})
app.get('/products', (req, res)=>{
    res.send(products)
})
app.listen(PORT, ()=>{
    console.log(`Ecommerce backend running on port ${PORT} `)
})
