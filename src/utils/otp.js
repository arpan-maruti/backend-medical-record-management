// Import Twilio using ES module syntax
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

console.log('Environment Variables Loaded:');
console.log(process.env);
// Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Twilio Verify Service SID
const serviceSid = process.env.TWILIO_SERVICE_SID; // Replace with your Twilio Verify Service SID

// Phone number to send the OTP
const toPhoneNumber = '+917863048907'; // Replace with the recipient's phone number

// Send OTP via SMS
const sendOTP = async () => {
  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: toPhoneNumber, channel: 'sms' });

    console.log(`Verification SID: ${verification.sid}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

// Call the function to send OTP
sendOTP();







     