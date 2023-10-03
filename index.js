const express = require('express')
const port = 3000
const app = express()

const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
    res.send('Hello World')
})


async function main() {

    app.post('/login', async (req, res) => {
        const { email, password } = req.body
        const user = await prisma.user.findUnique({
            where: {
                email: email,
                password: password
            }
    
        })
        if(user) {
            return res.status(200).send({id: user.id, email: user.email})
        } else if(!user){
           res.sendStatus(401)

        }
    })

    app.post('/login/create', async (req, res) => {
        const { email, password } = req.body
        let user
        
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        
        !existingUser ? user = await prisma.user.create({
            data: {
                email: email,
                password: password
            }
        }) : null
        
        if(user) {
            return res.status(200).send({id: user.id, email: user.email})
        } else {
            return res.sendStatus(401)
        }

    })

    app.get('/listas/:userId', async (req, res) => {
        const { userId } = req.params

        const listas = await prisma.listaCorte.findMany({
            where: {
                userId: Number(userId),
            }
        })


        res.status(200).send(listas)
    })


    app.post('/listas/:userId', async (req, res) => {
        const { userId } = req.params
        const { lista, date } = req.body


        await prisma.listaCorte.create({
            data: {
                userId: Number(userId),
                lista: lista,
                date: date
            }
        })
    })


    app.post('/listas/delete/:userId', async(req, res) => {
        const { userId } = req.params
        const { id } = req.body

        await prisma.listaCorte.deleteMany({
            where: {
                userId: Number(userId),
                id: Number(id)
            }
        })

    })

    
}


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async(err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })


try {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    })
} catch(err) {
    console.error(err)
}
