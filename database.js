const sqlite3 = require('sqlite3').verbose();

// 1. Create a connection to the database file
const db = new sqlite3.Database('./triage.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database successfully.");
    }
});

// 2. Create our table if it doesn't exist yet
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS triage_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            issue_text TEXT,
            ai_response TEXT,
            status TEXT,
            attempts INTEGER
        )
    `);
    console.log("Triage logs table is ready.");
});

// 3. Create a helper function to save our AI's attempts
function logAttempt(issueText, aiResponse, status, attempts) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO triage_logs (issue_text, ai_response, status, attempts) VALUES (?, ?, ?, ?)`;

        // We use the '?' placeholders to prevent SQL injection
        db.run(query, [issueText, aiResponse, status, attempts], function (err) {
            if (err) {
                console.error("Failed to save log:", err.message);
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// 4. Export the function so our main AI file can use it later
module.exports = { logAttempt };