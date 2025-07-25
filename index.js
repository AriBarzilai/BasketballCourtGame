import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const app = express()
const port = 8000

app.use("/src", express.static(__dirname + "/src"));

app.use("/sounds", express.static(__dirname + "/sounds"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.listen(port, () => {
  console.log(`Netta and Ari's super cool basketball game app which deserves at least a grade of 100 is listening on port ${port}`)
  console.log(`http://localhost:8000`)
})  