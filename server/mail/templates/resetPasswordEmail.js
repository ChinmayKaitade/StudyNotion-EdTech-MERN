/**
 * @function resetPasswordEmail
 * @description Generates the HTML content for the password reset link email.
 * @param {string} url - The complete, time-sensitive URL for the user to reset their password.
 * @param {string} name - The first name of the user for personalization.
 * @returns {string} The complete HTML template string.
 */
exports.resetPasswordEmail = (url, name) => {
  return `<!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <title>Password Reset Request</title>
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
                  border-radius: 8px;
              }
      
              .logo {
                  max-width: 200px;
                  margin-bottom: 20px;
                  background-color: #ffffff;
                  padding: 12px;
                  border-radius: 8px;
              }
      
              .message {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  color: #000000;
              }
      
              .body {
                  font-size: 16px;
                  margin-bottom: 20px;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  text-align: left;
              }
  
              .greeting {
                  font-weight: bold;
              }
      
              .cta {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #FFD60A;
                  color: #000000;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: bold;
                  margin-top: 20px;
                  transition: background-color 0.3s ease;
              }
  
              .cta:hover {
                  background-color: #e6c509;
              }
      
              .footer {
                  font-size: 14px;
                  color: #777777;
                  margin-top: 20px;
              }
          </style>
      
      </head>
      
      <body>
          <div class="container">
              <a href="https://studynotion-edtech-mern.vercel.app/"><img class="logo" 
                      src="https://i.ibb.co/ds6RzBPq/Study-Notion-Dark.png" alt="StudyNotion Logo"></a>
              
              <div class="body">
                  <p class="greeting">Hello ${name},</p>
                  <p>
                      You have requested to reset the password for your StudyNotion account.
                  </p>
                  <p>
                      To proceed, please click the button below.
                  </p>
                  <a class="cta" href="${url}">Reset Password</a>
                  <p style="margin-top: 30px;">
                      This password reset link is valid for 5 minutes. If you did not request this password reset, please ignore this email.
                  </p>
              </div>
  
              <div class="footer">
                  If the button above doesn't work, you can copy and paste the following link into your browser: <br/>
                  <a href="${url}" style="word-break: break-all;">${url}</a>
                  <p>
                      Need help? Contact support at <a href="mailto:chinmaykaitade123@gmail.com">chinmaykaitade123@gmail.com</a>.
                  </p>
              </div>
          </div>
      </body>
      
      </html>`;
};
