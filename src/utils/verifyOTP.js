// Import Twilio using ES module syntax
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

// Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Twilio Verify Service SID
const serviceSid = process.env.TWILIO_SERVICE_SID; // Replace with your Twilio Verify Service SID

// Phone number to send the OTP
const toPhoneNumber = '+917863048907'; // Replace with the recipient's phone number

const verifyOTP = async (code) => {
    try {
      const verificationCheck = await client.verify.v2.services(serviceSid)
        .verificationChecks
        .create({ to: toPhoneNumber, code });
  
      if (verificationCheck.status === 'approved') {
        console.log('OTP verification successful!');
      } else {
        console.log('OTP verification failed:', verificationCheck.status);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };
  
  // Call the function with the received OTP
  verifyOTP('963748'); // Replace '123456' with the OTP sent to your phone
  









     