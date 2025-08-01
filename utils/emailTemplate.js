function emailTemplate(title, message) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                padding: 0;
                margin: 0;
            }
            .container {
                background: #ffffff;
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                background: #2e7d32;
                color: white;
                padding: 15px;
                border-radius: 8px 8px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                color: #333;
                line-height: 1.5;
            }
            .btn {
                display: inline-block;
                background: #2e7d32;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 15px;
            }
            .footer {
                text-align: center;
                padding: 15px;
                font-size: 12px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Project Annapurna</h1>
            </div>
            <div class="content">
                <h2>${title}</h2>
                <p>${message}</p>
                <a class="btn" href="http://yourwebsite.com/login">Go to Dashboard</a>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Project Annapurna. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
module.exports = emailTemplate;
