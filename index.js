// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const path=require('path');
const ejs=require('ejs');   
// Create an Express application
const app = express();    

// Middleware to parse JSON requests
app.use(bodyParser.json());

// ejs view engine to create dynamic page
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hal987@@@',
  database: 'emailverify'
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
});

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., Gmail
  auth: {
    user: 'haldersumanaqz123@gmail.com',
    pass: 'qquc ifng eqlx vlvc'
  }      
});

// Route to handle email verification
app.post('/verify-email', (req, res) => {
  const { email } = req.body;
  console.log(email);

  // Generate OTP
  const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

  // Save OTP and email to database
  connection.query('INSERT INTO otps (email, otp) VALUES (?, ?)', [email, otp], (error, results, fields) => {
    if (error) {
      console.error('Error saving OTP to database: ' + error);
      res.status(500).json({ error: 'An error occurred while saving OTP to database' });
      return;
    }

    // Send OTP via email
    transporter.sendMail({
      from: 'haldersumanaqz123@gmail.com',    
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`
    }, (error, info) => {
      if (error) {
        console.error('Error sending email: ' + error);
        res.status(500).json({ error: 'An error occurred while sending email' });
        return;
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'OTP sent successfully' });
    });
  });
});

// Route to handle OTP verification
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  // Check OTP from database
  connection.query('SELECT * FROM otps WHERE email = ? AND otp = ?', [email, otp], (error, results, fields) => {
    if (error) {
      console.error('Error verifying OTP: ' + error);
      res.status(500).json({ error: 'An error occurred while verifying OTP' });
      return;
    }

    if (results.length === 0) {
      res.status(400).json({ error: 'Invalid OTP' });
    } else {
      // Mark email as verified in database
      connection.query('UPDATE users SET email_verified = 1 WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
          console.error('Error marking email as verified: ' + error);
          res.status(500).json({ error: 'An error occurred while marking email as verified' });
          return;
        }            
        res.status(200).json({ message: 'Email verified successfully' });    
      });
    }
  });
});

app.get('/', (req, res)=>{
  res.render('index');
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



