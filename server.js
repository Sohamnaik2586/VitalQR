const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve static files for the frontend

// MongoDB connection
mongoose.connect('mongodb+srv://sohamnaik2586:ztHVThe8UAFaio76@cluster1.4an6p.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// MongoDB Schema and Model
const medicalDataSchema = new mongoose.Schema({
  name: String,
  age: Number,
  bloodGroup: String,
  allergies: String,
  emergencyContact: String,
  qrCodeUrl: String,
});

const MedicalData = mongoose.model('MedicalData', medicalDataSchema);

// Function to create the blood droplet icon with the blood group text
async function createBloodDroplet(bloodGroup) {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext('2d');

  // Load the blood droplet image
  const dropletImage = await loadImage(path.join(__dirname, 'public', 'blood_droplet.png'));

  // Draw the blood droplet image onto the canvas
  ctx.drawImage(dropletImage, 0, 0, 200, 200);

  // Add the blood group text
  ctx.font = 'bold 50px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(bloodGroup, 100, 110);

  return canvas.toDataURL();
}

// Save medical data and generate QR code
app.post('/generate', async (req, res) => {
  try {
    const { name, age, bloodGroup, allergies, emergencyContact } = req.body;

    // Generate QR code data
    const qrData = `Name:${name}\nAge:${age}\nBlood Group:${bloodGroup}\nAllergies:${allergies}\nEmergency Contact:${emergencyContact}`;

    // Create the blood droplet with the blood group text
    const logoDataUrl = await createBloodDroplet(bloodGroup);

    // Generate the base QR code
    const canvas = createCanvas(300, 300);
    await QRCode.toCanvas(canvas, qrData, {
      color: {
        dark: '#00008b', // Dark blue
        light: '#ffefd5', // Pale peach
      },
      margin: 4,
    });

    // Load the QR code as an image
    const qrImage = await loadImage(canvas.toDataURL());
    const ctx = canvas.getContext('2d');
    ctx.drawImage(qrImage, 0, 0);

    // Load the blood droplet logo
    const logoImage = await loadImage(logoDataUrl);

    // Calculate the position and size of the logo
    const logoSize = 0.2 * canvas.width;
    const logoX = (canvas.width - logoSize) / 2;
    const logoY = (canvas.height - logoSize) / 2;

    // Draw the blood droplet logo onto the QR code
    ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

    // Get the final QR code with the logo
    const qrCodeUrl = canvas.toDataURL();

    // Save to database
    const newData = new MedicalData({
      name,
      age,
      bloodGroup,
      allergies,
      emergencyContact,
      qrCodeUrl,
    });

    await newData.save();

    res.status(201).json({ message: 'QR code generated and data saved successfully!', qrCodeUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
  } else {
    console.error(err);
  }
});
