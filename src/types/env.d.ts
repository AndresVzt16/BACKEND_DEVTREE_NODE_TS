declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string
    PORT?: string
    JWT_SECRET?:string
    FRONTEND_URL?:string
    NODE_ENV?: 'development' | 'production'
    MAILGUN_API_KEY:string
  }
}