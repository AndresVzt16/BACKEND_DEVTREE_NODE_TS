import server from './server'
import { connectDB } from './config/db'


const PORT = process.env.PORT || 4000

connectDB()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})




