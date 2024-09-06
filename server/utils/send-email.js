// import sgMail from "@sendgrid/mail";

// export const verficationEmail = async (recipient, token) => {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//   const msg = {
//     to: recipient, // Change to your recipient
//     from: "pavitramodi.it@charusat.ac.in", // Change to your verified sender
//     subject: "Email Verfication",
//     text: "click below link to verify your email",
//     html: `<a href="http://localhost:3100/api/v1/auth/verify?token=${token}">Verify Email</a>`,
//   };

//   await sgMail.send(msg);
// };

// export const successEmail = async (recipient) => {
//   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//   const msg = {
//     to: recipient, // Change to your recipient
//     from: "pavitramodi.it@charusat.ac.in", // Change to your verified sender
//     subject: "Email Verfication Completed",
//     html: `<h1>Email Verified</h1>`,
//   };

//   await sgMail.send(msg);
// };
