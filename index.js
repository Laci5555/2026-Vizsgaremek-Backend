import express from "express"
import cors from "cors"
import multer from "multer"
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config({ path: './.env' })


const app = express()
app.use(express.json())
app.use(cors())


const upload = multer({
  storage: multer.memoryStorage()
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

    res.status(201).send({ url: result.secure_url, public_id: result.public_id });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function uploadPfp(req, res) {
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
    res.status(201).send({ url: result.secure_url, public_id: result.public_id });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
}

async function deleteImage(req, res) {
  let { public_id } = req.body
  console.log(public_id);

  if (public_id) {
    const result = await cloudinary.uploader.destroy(public_id);
    console.log(result);
    res.status(200).send({ msg: "Succesful Deletion!" })
  } else {
    res.status(400).send({ msg: "Image not found" })
  }
}

app.get("/", (req, res) => res.send("Games v1.0.0 (-_-)"))

app.post("/uploadFile", upload.single('file'), uploadFile)
app.post("/uploadPfp", upload.single('file'), uploadPfp)
app.delete("/deleteImage", deleteImage)

app.post("/check-email", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send({ error: 'Email is required' });

  // Simple regex check for @ and .
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).send({
      valid: false,
      message: "Invalid email format. Please include '@' and a domain (e.g., .com)."
    });
  }

  res.status(200).send({ valid: true });
});

app.post("/welcome-email", async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res.status(400).send({ error: "Email and username are required" });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    // Itt megadhatsz egy tetszőleges nevet, de az email címnek az EMAIL_USER-nek kell lennie a Gmailnél
    from: `"Gamminity Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Gamminity!',
    html: `
      <div style="background-color: #0b0b0f; padding: 50px 20px; font-family: 'Inter', Helvetica, Arial, sans-serif; text-align: center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #13131a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <!-- Top Shimmer Area -->
          <tr>
            <td align="center" style="padding: 60px 40px; background: radial-gradient(circle at top left, rgba(108, 99, 255, 0.15), transparent), #13131a;">
              <h1 style="margin: 0; font-family: 'Syne', sans-serif; font-size: 48px; font-weight: 800; color: #ffffff; letter-spacing: -2px; line-height: 1;">
                Gamminity
              </h1>
              <p style="margin: 15px 0 0; color: #8888aa; font-size: 14px; font-weight: 500; letter-spacing: 1px;">
                YOUR BEST PLATFORM FOR COMMUNICATION ABOUT GAMING!
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 40px 40px; color: #f0eeff;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, rgba(108, 99, 255, 0.5), transparent); margin-bottom: 40px;"></div>
              
              <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                Discover, Rate & <br/>Discuss Your Favorite Games
              </h2>
              
              <p style="margin: 0 0 35px; font-size: 16px; line-height: 1.7; color: #8888aa; max-width: 450px; margin-left: auto; margin-right: auto;">
                Welcome, <strong>${username}</strong>! We're thrilled to have you. Browse our growing collection, share your opinions, and connect with fellow gamers in one place.
              </p>
              
              <!-- Action Button -->
              <div align="center" style="margin-bottom: 20px;">
                <a href="https://gamminity.netlify.app" style="background: #6c63ff; background: linear-gradient(135deg, #6c63ff 0%, #a5b4fc 100%); color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(108, 99, 255, 0.4);">
                  Back to Gamminity →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #0b0b0f; color: #444455; font-size: 11px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0;">&copy; 2026 Gamminity Community. All rights reserved.</p>
              <p style="margin: 5px 0 0;">Budapest, Hungary</p>
            </td>
          </tr>
        </table>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ msg: "Welcome email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ error: "Failed to send welcome email" });
  }
});

// Health check végpont a frontend monitoringhoz és Render keep-alive-hoz
app.get("/health", (req, res) => {
  res.status(200).send({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(88, err => {
    console.log(err ? err : `Server on :88`);
  });
}

export default app;