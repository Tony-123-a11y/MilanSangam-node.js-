import express from "express";
import http from 'http'
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/connectDB.js";
import userRouter from "./routes/userRouter.js";
import profileRouter from "./routes/profileRouter.js";
import actionRouter from "./routes/matchProfileRouter.js";
import messageRouter from "./routes/messageRouter.js";
import { Server } from "socket.io";
import { mainSocket } from "./socket.js";
import { interestRouter } from "./routes/interestRouter.js";

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.dev";

dotenv.config({ path: envFile }); 

const app = express();
const server= http.createServer(app)
const io= new Server(server)
mainSocket(io)

console.log(process.env.ClientUrl);

app.use(cors({
  origin: [process.env.ClientUrl],
  credentials: true // Required to allow cookies, including HttpOnly cookies
}));

app.use(express.json());  
// main server file
app.use('/uploads', express.static('uploads'));


app.get("/", (req, res) => {
  res.send("API is running vivah sanyog");
});

app.get('/health',(req,res)=>{
  res.json({message:'Health is OK'});
})

app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/matchprofile",actionRouter);
app.use('/api/messages',messageRouter);
app.use('/api/interest',interestRouter);

const PORT = process.env.PORT;

connectDB()
  .then(() => {
    server.listen(PORT || 3030, () => {
      console.log(`Server is listening on ${PORT}`);
      console.log("MongoDb connected");
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);

  });
