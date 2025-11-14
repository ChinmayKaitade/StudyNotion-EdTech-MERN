const { eventNames } = require("../../models/Section");

const otpTemplate = (otp, name) => {
  return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>OTP Verification Email</title>
  <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: #333333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
        background-color: #f9f9f9;
      }

      .logo {
        max-width: 200px;
        margin-bottom: 20px;
        background-color: #ffdf3f;
        padding: 7px;
      }

      .message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .body {
        font-size: 16px;
        margin-bottom: 20px;
        background-color: #ffffff;
        padding: 12px;
      }

      .user {
        font-weight: bold;
      }

      .cta {
        display: inline-block;
        padding: 10px 20px;
        background-color: #ffd60a;
        color: #000000;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        font-weight: bold;
        margin-top: 20px;
      }

      .support {
        font-size: 14px;
        color: #999999;
        margin-top: 20px;
      }

      .otp {
        /* background-color: red; */
        width: 100%;
      }

      .highlight {
        font-weight: bold;
        background-color: #eeeeee;
        margin: 0 auto;
        width: 150px;
        padding: 4px;
      }
    </style>
	
	</head>
	
	<body>
    <div class="container">
      <a href=""
        ><img
          class="logo"
          src="https://i.ibb.co/ds6RzBPq/Study-Notion-Dark.png"
          alt="StudyNotion Logo"
      /></a>
      <div class="message">OTP Verification Email</div>

      <div class="body">
        <p class="user">Dear ${name}</p>
        <p>
          Thank you for registering with StudyNotion. To complete your
          registration, please use the following OTP (One-Time Password) to
          verify your account:
        </p>

        <div class="otp">
          <h2 class="highlight">${otp}</h2>
        </div>

        <p>
          This OTP is valid for 3 minutes. If you did not request this
          verification, please disregard this email. Once your account is
          verified, you will have access to our platform and its features.
        </p>
      </div>

      <div class="support">
        If you have any questions or need assistance, please feel free to reach
        out to us at
        <a href="mailto:chinmaykaitade123@gmail.com"
          >chinmaykaitade123@gmail.com</a
        >. We are here to help!
      </div>
    </div>
  </body>
	</html>`;
};
module.exports = otpTemplate;
