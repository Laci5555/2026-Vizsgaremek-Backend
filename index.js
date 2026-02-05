import express from "express"
import cors from "cors"
import multer from "multer"
import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv';

dotenv.config({ path: './.env' })


const app = express()
app.use(express.json())
app.use(cors())


const upload = multer({
    storage:multer.memoryStorage()
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).send({ msg: "Error missing file" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gameImages',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    res.status(201).send({ url: result.secure_url });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

app.get("/", (req,res)=>res.send("Games v1.0.0 (-_-)"))

app.post("/uploadFile", upload.single('file'), uploadFile)

app.listen(88, err=>{
    console.log(err?err:"Server on :88");
})