/**
 * @function paymentSuccess
 * @description Generates the HTML content for the payment success email template.
 * This email confirms the user's payment and provides transaction details.
 * @param {number} amount - The total amount paid (in Rupees, not paise).
 * @param {string} paymentId - The unique ID assigned by the payment gateway (Razorpay).
 * @param {string} orderId - The unique ID for the order created on the server.
 * @param {string} name - The user's first name.
 * @param {string} lastname - The user's last name.
 * @returns {string} The complete HTML template string.
 */
exports.paymentSuccess = (amount, paymentId, orderId, name, lastname) => {
  return `<!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="UTF-8">
            <title>Course Registration Confirmation</title>
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
                }
        
                .logo {
                    max-width: 200px;
                    margin-bottom: 20px;
                }
        
                .message {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
        
                .body {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
        
                .cta {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #FFD60A;
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
        
                .highlight {
                    font-weight: bold;
                }
            </style>
        
        </head>
        
        <body>
            <div class="container">
                <a href="https://studynotion-edtech-project.vercel.app"><img class="logo" src="https://i.ibb.co/7Xyj3PC/logo.png"
                        alt="StudyNotion Logo"></a>
                <div class="message">
                Your payment of ₹${amount} has been successfully received.
                </div>
                <div class="body">
                    <p>Dear ${name} ${lastname},</p>
                    <p>
                        Thank you for purchasing the course. Your payment of ₹${amount} has been successfully received.
                    </p>
                    <p>
                        Your payment ID is <span class="highlight">${paymentId}</span> and your order ID is <span
                            class="highlight">${orderId}</span>.
                    </p>
                </div>
                <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
                        href="mailto:info@studynotion.com">info@studynotion.com</a>. We are here to help!</div>
            </div>
        </body>
        
        </html>`;
};
