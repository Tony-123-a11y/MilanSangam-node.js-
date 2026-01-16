import axios from "axios";

export const sendOtpSms = async (mobile, otp) => {
  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q", // for custom message use "q"
        message: `Your OTP is: ${otp}`,
        language: "english",  
        flash: 0,
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("SMS Response:", response.data);
  } catch (error) {
    console.error("Failed to send SMS:", error.response?.data || error.message);
  }
};
