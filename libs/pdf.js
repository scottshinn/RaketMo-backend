const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateUniqueFileName(baseName = "job-summary") {
    const timestamp = Date.now(); // e.g., 1694456789012
    return `${baseName}-${timestamp}.pdf`;
}
// Helper to generate filename
function generateUniqueFileName(baseName = "job-summary") {
    const timestamp = Date.now();
    return `${baseName}-${timestamp}.pdf`;
}

function generateJobSummaryPDF(data, options = {}) {
    const fileName = generateUniqueFileName(data.workerName.replace(/\s+/g, '-').toLowerCase());
    const outputPath = `./public/uploads/${fileName}`;
    const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
    });

    doc.pipe(fs.createWriteStream(outputPath));

    // Colors
    const colors = {
        primary: '#2563eb',
        secondary: '#1e40af',
        success: '#059669',
        danger: '#dc2626',
        gray: '#6b7280',
        lightGray: '#f3f4f6',
        white: '#ffffff',
        text: '#1f2937'
    };

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill(colors.primary);
    doc.fontSize(24).fillColor(colors.white).text('RaketMo', 50, 25, { align: 'left' });
    doc.fontSize(28).fillColor(colors.white).text('Job Summary', 0, 25, { align: 'center' });
    doc.y = 120;

    // Worker Information Card
    const cardY = doc.y;
    doc.rect(40, cardY, doc.page.width - 80, 140).fill(colors.lightGray).stroke();

    doc.fillColor(colors.text).fontSize(16).font('Helvetica-Bold').text('Worker Information', 60, cardY + 20);
    doc.font('Helvetica').fontSize(12).fillColor(colors.gray).text('Name', 60, cardY + 45)
        .fillColor(colors.text).fontSize(14).font('Helvetica-Bold').text(data.workerName, 60, cardY + 60);
    doc.font('Helvetica').fontSize(12).fillColor(colors.gray).text('Job Title', 60, cardY + 85)
        .fillColor(colors.text).fontSize(14).font('Helvetica-Bold').text(data.jobTitle, 60, cardY + 100);

    // Job Description
    doc.y = cardY + 160;
    doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.text).text('Job Description', 50, doc.y);
    doc.font('Helvetica').fontSize(12).fillColor(colors.text).text(data.jobDescription, 50, doc.y + 25, {
        width: doc.page.width - 100,
        align: 'justify'
    });

    // Payment Summary
    doc.y += 80;
    const financeY = doc.y;
    doc.rect(40, financeY, doc.page.width - 80, 35).fill(colors.secondary);
    doc.fontSize(18).fillColor(colors.white).font('Helvetica-Bold').text('Payment Summary', 0, financeY + 10, { align: 'center' });
    doc.rect(40, financeY + 35, doc.page.width - 80, 100).fill(colors.white).stroke(colors.gray);

    const total = Number(data.total_job_amount);
    doc.fillColor(colors.text).fontSize(14).font('Helvetica-Bold').text('Total Job Amount:', 60, financeY + 55);
    doc.fillColor(total >= 0 ? colors.success : colors.danger).fontSize(14).text(`$${total.toFixed(2)}`, 200, financeY + 55);

    doc.fillColor(colors.danger).fontSize(14).font('Helvetica-Bold').text('Platform Fee:', 60, financeY + 85);
    doc.fillColor(colors.danger).fontSize(16).text(`-$${data.rakettMo_fee}`, 200, financeY + 85);

    doc.fillColor(colors.success).fontSize(18).font('Helvetica-Bold').text('You Earned:', 60, financeY + 115);
    doc.fillColor(colors.success).fontSize(18).font('Helvetica-Bold').text(`$${data.you_earned}`, 200, financeY + 115);
    doc.moveTo(60, financeY + 110).lineTo(doc.page.width - 60, financeY + 110).stroke(colors.gray);

    // DATE SECTION (Highlighted)
    doc.y = financeY + 160;
    const dateBoxHeight = 30;
    doc.rect(40, doc.y, doc.page.width - 80, dateBoxHeight).fill(colors.primary);
    const generatedDate = new Date().toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
    doc.fillColor(colors.white).fontSize(12).font('Helvetica-Bold')
        .text(`Generated on ${generatedDate}`, 0, doc.y + 8, { align: 'center' });

    // NOTE SECTION BELOW DATE
    doc.y += dateBoxHeight + 10;
    const noteBoxHeight = 60;
    doc.rect(40, doc.y, doc.page.width - 80, noteBoxHeight).fill(colors.lightGray).stroke(colors.gray);

    // info circle
    doc.circle(55, doc.y + 20, 8).fill(colors.primary);
    doc.fillColor(colors.white).fontSize(10).font('Helvetica-Bold').text('i', 52, doc.y + 17);

    doc.fillColor(colors.text).fontSize(11).font('Helvetica')
        .text('Note: Funds will be transferred to your bank via Stripe in 1–3 business days.',
            75, doc.y + 15, { width: doc.page.width - 130, align: 'left' });

    // Finalize PDF
    doc.end();
    return { fileName, outputPath };
}


module.exports = {
    generateJobSummaryPDF
}