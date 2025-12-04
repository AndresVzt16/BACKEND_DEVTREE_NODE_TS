import server from './server'
import dotenv from 'dotenv'
import { connectDB } from './config/db'


const PORT = process.env.PORT || 4000

dotenv.config()
connectDB()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})




