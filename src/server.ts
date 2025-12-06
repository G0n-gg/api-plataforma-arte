import express from 'express'
import routes from './routes'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { corsOrigin } from './config'

const app = express()
const PORT: any = process.env.PORT ?? 8000

app.use(cors({
    origin: process.env.CORS_ORIGIN || corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.use(express.json())
app.use(cookieParser())

app.use('/', routes)

app.listen(PORT, () => {
    console.log(`Servidor en puerto ${PORT}`)
})