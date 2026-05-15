import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin (optional, but good for security)
// In this environment, we might not have a formal service account JSON
// but we can at least try to verify ID tokens if the env is set up.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.warn("Firebase Admin could not be initialized. Security checks will be limited.");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint: Send Approval Email with PDF
  app.post('/api/send-approval-email', async (req, res) => {
    const { permit, userEmail, userName } = req.body;

    console.log(`[Email] Memulai proses pengiriman untuk: ${userEmail} (${permit.id})`);

    if (!permit || !userEmail) {
      console.error('[Email] Data tidak lengkap');
      return res.status(400).json({ error: 'Missing permit data or user email' });
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[Email] SMTP tidak terkonfigurasi di Secrets/Environment Variables');
      return res.status(500).json({ error: 'SMTP Configuration Missing. Please check Secrets menu.' });
    }

    try {
      // 1. Generate PDF
      const doc = new jsPDF() as any;
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(96, 0, 24); // Burgundy
      doc.text('SURAT KETERANGAN IJIN', 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('JURNALIS NUANSA INTEGRATED SYSTEM', 105, 38, { align: 'center' });
      
      doc.setDrawColor(96, 0, 24);
      doc.line(20, 45, 190, 45);

      // Body
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nomor Surat: JN-SURAT-${permit.id.slice(-6).toUpperCase()}`, 20, 60);
      doc.text(`Tanggal Terbit: ${new Date().toLocaleDateString('id-ID')}`, 20, 70);
      
      doc.text('Diterangkan dengan ini bahwa:', 20, 90);
      doc.text(`Nama: ${userName}`, 30, 100);
      doc.text(`Email: ${userEmail}`, 30, 110);
      
      doc.text(`Telah disetujui untuk pengajuan:`, 20, 130);
      doc.setFont('helvetica', 'bold');
      doc.text(permit.typeName, 30, 140);
      doc.setFont('helvetica', 'normal');

      // Requirements Table
      const tableData = Object.entries(permit.data).map(([key, value]) => [key.toUpperCase(), value]);
      autoTable(doc, {
        startY: 155,
        head: [['DETAIL PERSYARATAN', 'KETERANGAN']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [96, 0, 24] },
      });

      // Footer
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.text('Status: TERVALIDASI SECARA DIGITAL', 20, finalY);
      doc.setFontSize(8);
      doc.text('Dokumen ini sah dan diterbitkan secara resmi oleh sistem Jurnalis Nuansa.', 20, finalY + 10);
      
      const pdfBuffer = doc.output('arraybuffer');

      // 2. Prepare Email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || '"Jurnalis Nuansa" <noreply@jurnalisnuansa.org>',
        to: userEmail,
        subject: `[DISETUJUI] Pengajuan Surat: ${permit.typeName}`,
        text: `Halo ${userName},\n\nPengajuan surat Anda dengan jenis "${permit.typeName}" telah disetujui oleh Admin.\n\nSilakan temukan salinan digital surat ijin Anda terlampir dalam bentuk PDF.\n\nSalam,\nTim Jurnalis Nuansa`,
        attachments: [
          {
            filename: `Surat_Ijin_${permit.id.slice(-6).toUpperCase()}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ],
      };

      // 3. Send Email
      console.log(`[Email] Sinkronisasi dengan SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] Terkirim! ID Pesan:', info.messageId);

      res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
    } catch (error: any) {
      console.error('Email sending error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
