import twilio from 'twilio';


// Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID; // Your Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Twilio Auth Token
const serviceSid = process.env.TWILIO_SERVICE_SID; // Your Twilio Verify Service SID

// Validate environment variables
if (!accountSid || !authToken || !serviceSid) {
  throw new Error("Missing Twilio environment variables. Check your .env file.");
}

// Initialize Twilio client
const client = twilio(accountSid, authToken);

export const verifyOTP = async (phoneNumber, code) => {
  try {
    console.log("Service SID:", serviceSid);
    console.log("Phone Number:", phoneNumber);
    console.log("OTP Code:", code);

    // Call Twilio Verify API
    const verificationCheck = await client.verify.v2.services(serviceSid)
      .verificationChecks
      .create({ to: phoneNumber, code });

    console.log("Verification Check Response:", verificationCheck);
    return verificationCheck; // Return the entire verification check object
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    if (error.code) {
      console.error("Error Code:", error.code);
      console.error("More Info:", error.moreInfo);
    }
    throw error; // Propagate the error for further handling
  }
};

// Test the function
verifyOTP('+917863048907', '264514')
  .then(response => {
    console.log("OTP Verified Successfully:", response);
  })
  .catch(error => {
    console.error("Verification Failed:", error.message);
  });
