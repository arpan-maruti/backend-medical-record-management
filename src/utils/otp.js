import twilio from 'twilio';
import dotenv from 'dotenv';


const JWT_SECRET = process.env.JWT_SECRET;

// Load environment variables
dotenv.config({ path: '../../.env' });

// Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

// Log to ensure environment variables are loaded
console.log('TWILIO_SID:', accountSid);
console.log('TWILIO_AUTH_TOKEN:', authToken);
console.log('TWILIO_SERVICE_SID:', serviceSid);

if (!accountSid || !authToken || !serviceSid) {
  throw new Error('Twilio credentials are not defined in environment variables');
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

export const sendOTP = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2.services(serviceSid)
      .verifications
      .create({ to: phoneNumber, channel: 'sms' });

    console.log('Verification SID:', verification.sid);
    return verification.sid; // Return the verification SID
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error; // Propagate the error to the calling function
  }
};

export const verifyOTP = async (phoneNumber, code) => {
  try {
    console.log('Service SID:', serviceSid);
    console.log('Phone Number:', phoneNumber);
    console.log('OTP Code:', code);

    // Call Twilio Verify API
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phoneNumber, code });

    console.log('Verification Check Response:', verificationCheck);
    return verificationCheck; // Return the entire verification check object
  } catch (error) {
    console.error('Error verifying OTP:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
      console.error('More Info:', error.moreInfo);
    }
    throw error; // Propagate the error for further handling
  }
};
