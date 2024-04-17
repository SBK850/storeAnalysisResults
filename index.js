const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mudfoot.doc.stu.mmu.ac.uk',
    user: 'bahkaras',
    password: 'hirsponD3',
    database: 'bahkaras',
    port: 6306
});

app.post('/store-analysis', async (req, res) => {
    try {
        await storeAnalysisData(req.body);
        res.status(200).send({ message: 'Analysis data stored successfully' });
    } catch (error) {
        console.error('Failed to store analysis data:', error);
        res.status(500).send({ message: 'Failed to store analysis data', error: error.message });
    }
});

async function storeAnalysisData(analysisData) {
    const connection = await pool.getConnection();
    try {
        const sql = `
            INSERT INTO AnalysisData (URL, Content, Metadata, ToxicityScore, ImageAnalysisResult, TextAnalysisResult)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        // Ensure that the values are properly formatted as strings for JSON fields
        const {
            url,
            content,
            metadata,
            toxicityScore,
            imageAnalysisResult,
            textAnalysisResult
        } = analysisData;

        // Convert metadata, imageAnalysisResult, and textAnalysisResult to JSON strings
        const metadataString = JSON.stringify(metadata || {});
        const imageAnalysisString = JSON.stringify(imageAnalysisResult || {});
        const textAnalysisString = JSON.stringify(textAnalysisResult || {});

        await connection.execute(sql, [
            url,
            content,
            metadataString,
            toxicityScore,
            imageAnalysisString,
            textAnalysisString
        ]);
    } catch (error) {
        console.error('Error in storeAnalysisData:', error);
        throw error; // Rethrow the error to be handled in the endpoint
    } finally {
        connection.release();
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
