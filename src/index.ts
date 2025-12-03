import server from './server'
import dotenv from 'dotenv'
import { connectDB } from './config/db'


const PORT = process.env.PORT || 3000

dotenv.config()
connectDB()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})


/* Types e Interfaces */

let exampleString = "Hello, TypeScript!"
let exampleNumber = 42

type User = {
  name: string
  age: number
  email: string
}

/* Crear herencia pick para extraer todos los types necesarios*/
type userEmail = Pick< User, "email" >


/* ejemplo con omit */
interface userEmailOmit {
  email: Omit< User, "email" >
}

let dataUser: User = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
}

let userEmailData: userEmail = {
  email: "alice@example.com"
}


