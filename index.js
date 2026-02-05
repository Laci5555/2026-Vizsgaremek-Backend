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
    console.log(result);
    
    res.status(201).send({ url: result.secure_url, publicId: result.publicId});

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function uploadPfp(req,res){
    try {
    if (!req.file) {
      return res.status(400).send({ msg: "Error missing file" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profilePictures',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      stream.end(req.file.buffer);
    });
    console.log(result);
    res.status(201).send({ url: result.secure_url, public_id: result.public_id});

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function deleteImage(req,res) {
    let {public_id} = req.body
    console.log(public_id);
    
    if(public_id){
        const result = await cloudinary.uploader.destroy(public_id);
        console.log(result);
        res.status(200).send({msg:"Succesful Deletion!"})
    }else{
        res.status(400).send({msg:"Image not found"})
    }
}

app.get("/", (req,res)=>res.send("Games v1.0.0 (-_-)"))

app.post("/uploadFile", upload.single('file'), uploadFile)
app.post("/uploadPfp", upload.single('file'), uploadPfp)
app.delete("/deleteImage", deleteImage)


app.listen(88, err=>{
    console.log(err?err:"Server on :88");
})