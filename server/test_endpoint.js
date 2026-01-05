require('dotenv').config();
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch'); // Assuming node-fetch is available or I'll use native fetch in node 18

// Admin ID from the dump
const adminId = "695a7ba14bfcf8a2b46f8451";
const secret = process.env.JWT_SECRET || 'secret123';

const token = jwt.sign({ id: adminId }, secret, { expiresIn: '30d' });

async function test() {
    try {
        const port = process.env.PORT || 5000;
        const url = `http://localhost:${port}/api/admin/all-users`;
        console.log(`Fetching from: ${url}`);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error(`Status: ${res.status}`);
            const text = await res.text();
            console.error(`Body: ${text}`);
            return;
        }

        const data = await res.json();
        console.log(`Total users returned: ${data.length}`);

        const approved = data.filter(u => u.isApproved).length;
        const pending = data.filter(u => !u.isApproved).length;

        console.log(`Approved: ${approved}`);
        console.log(`Pending: ${pending}`);

        console.log('--- IDs Returned ---');
        data.forEach(u => console.log(`${u.username} (${u.role}): Approved=${u.isApproved}`));

    } catch (error) {
        console.error('Error:', error);
    }
}

// Check if node-fetch is available, if not use global fetch (Node 18+)
if (!global.fetch) {
    global.fetch = require('node-fetch');
}

test();
