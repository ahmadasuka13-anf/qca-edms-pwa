/**
 * Vercel Serverless Function — Google Apps Script API Proxy
 * Menghilangkan CORS & mengikuti redirect 302 Google Apps Script di sisi server.
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // URL Web App Deployment Google Apps Script
  const GAS_EXEC_URL = process.env.GAS_EXEC_URL || 'https://script.google.com/macros/s/AKfycbxHv0P-UIPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

  try {
    const gasResponse = await fetch(GAS_EXEC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body || {}),
      redirect: 'follow'
    });

    const text = await gasResponse.text();
    try {
      const data = JSON.parse(text);
      return res.status(200).json(data);
    } catch (e) {
      // Ekstrak pesan error dari HTML jika Google Apps Script mengembalikan halaman error
      const bodyClean = text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const detailedErr = bodyClean.length > 250 ? bodyClean.slice(0, 250) + '...' : bodyClean;
      return res.status(200).json({
        success: false,
        message: 'Google Apps Script Error: ' + (detailedErr || 'Server Google mengembalikan HTML, bukan JSON.')
      });
    }
  } catch (err) {
    console.error('GAS Proxy Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Gagal terhubung ke Google Apps Script: ' + err.message
    });
  }
}
