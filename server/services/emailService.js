import sendEmail from "../utils/sendEmail.js";

export const sendHospitalVerificationEmail = async (hospitalEmail, hospitalName, status, reason = "") => {
  let subject = "";
  let html = "";

  if (status === "approved") {
    subject = "Arogyam - Hospital Account Approved ✅";
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Arogyam, ${hospitalName}!</h2>
        <p>Your hospital account has been <strong>approved</strong> by our administrative team.</p>
        <p>You can now log in to the Arogyam platform and access all clinical features, including managing doctors, tracking patients, and requesting records.</p>
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/hospital/login" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 5px;">Login Now</a>
      </div>
    `;
  } else if (status === "rejected") {
    subject = "Arogyam - Hospital Account Update";
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Important Update for ${hospitalName}</h2>
        <p>Unfortunately, your hospital registration request could not be approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>If you believe this was a mistake, or if you wish to appeal, please reply to this email or contact our support team.</p>
      </div>
    `;
  } else if (status === "suspended") {
    subject = "Arogyam - Hospital Account Suspended ⚠️";
    html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Important Update for ${hospitalName}</h2>
        <p>Your hospital account on Arogyam has been <strong>suspended</strong>.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please contact support immediately to resolve this issue.</p>
      </div>
    `;
  }

  try {
    await sendEmail(hospitalEmail, subject, html);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
