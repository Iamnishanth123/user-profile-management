const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Oracle DB Thin Driver Configuration
oracledb.initOracleClient({ libDir: '' });

// Oracle DB Configuration
const dbConfig = {
    user: 'nish',
    password: 'nish',
    connectString: 'localhost:1521/xe'
};

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for serving the HTML file
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/1usertable.html'); // Change 'your_html_file.html' to your actual HTML file
});

// Handle form submission
app.post('/1usertable', async (req, res) => {
    // Extract user data from the request body
    const userData = {
        userId: req.body['userId'],
        username: req.body['username'],
        email: req.body['email'],
        password: req.body['password'],
        dob: req.body['dob']
       
    };

    // Connect to the Oracle Database
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Insert user data into the database
        const result = await connection.execute(
            `INSERT INTO USER_R (USERID, USERNAME, EMAIL, PASSWORD, DOB, SUBSCRIPTION_STATUS) VALUES 
            (:userId, :username, :email, :password, TO_DATE(:dob, 'YYYY-MM-DD'), :subscriptionStatus)`,
            userData
        );

        // Commit the transaction
        await connection.commit();

        console.log(result);

        res.send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
