import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PdfUploader.css';

// PDF.js worker'ı ayarla - Vite dev server için
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

interface PdfUploaderProps {
    onTransactionsExtracted: (transactions: Transaction[]) => void;
}

function PdfUploader({ onTransactionsExtracted }: PdfUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const categorizeTransaction = (description: string): string => {
        const desc = description.toLowerCase();

        // Groceries - Market alışverişleri
        if (desc.includes('market') || desc.includes('migros') || desc.includes('carrefour') ||
            desc.includes('a101') || desc.includes('bim') || desc.includes('şok') ||
            desc.includes('a 101') || desc.includes('a-101')) {
            return 'Groceries';
        }

        // Dining - Yemek ve içecek
        if (desc.includes('restaurant') || desc.includes('cafe') || desc.includes('starbucks') ||
            desc.includes('mcdonald') || desc.includes('burger') || desc.includes('pizza') ||
            desc.includes('kahve') || desc.includes('restoran') || desc.includes('lokanta') ||
            desc.includes('yemek') || desc.includes('kfc') || desc.includes('popeyes')) {
            return 'Dining';
        }

        // Transportation - Ulaşım
        if (desc.includes('uber') || desc.includes('taxi') || desc.includes('taksi') ||
            desc.includes('metro') || desc.includes('bus') || desc.includes('otobüs') ||
            desc.includes('benzin') || desc.includes('akaryakıt') || desc.includes('shell') ||
            desc.includes('opet') || desc.includes('petrol') || desc.includes('po ') ||
            desc.includes('bp ')) {
            return 'Transportation';
        }

        // Entertainment - Eğlence
        if (desc.includes('cinema') || desc.includes('sinema') || desc.includes('netflix') ||
            desc.includes('spotify') || desc.includes('game') || desc.includes('oyun') ||
            desc.includes('bilet') || desc.includes('ticket')) {
            return 'Entertainment';
        }

        // Shopping - Alışveriş
        if (desc.includes('zara') || desc.includes('h&m') || desc.includes('mango') ||
            desc.includes('lcw') || desc.includes('koton') || desc.includes('defacto') ||
            desc.includes('waikiki') || desc.includes('mavi') || desc.includes('colin') ||
            desc.includes('boyner') || desc.includes('marks') || desc.includes('spencer')) {
            return 'Shopping';
        }

        // Utilities - Faturalar
        if (desc.includes('electric') || desc.includes('elektrik') || desc.includes('su ') ||
            desc.includes('doğalgaz') || desc.includes('internet') || desc.includes('fatura') ||
            desc.includes('bill') || desc.includes('ttnet') || desc.includes('turkcell') ||
            desc.includes('vodafone') || desc.includes('türk telekom')) {
            return 'Utilities';
        }

        // Healthcare - Sağlık
        if (desc.includes('eczane') || desc.includes('pharmacy') || desc.includes('hospital') ||
            desc.includes('hastane') || desc.includes('doktor') || desc.includes('klinik') ||
            desc.includes('sağlık') || desc.includes('health')) {
            return 'Healthcare';
        }

        // Education - Eğitim
        if (desc.includes('school') || desc.includes('okul') || desc.includes('university') ||
            desc.includes('üniversite') || desc.includes('course') || desc.includes('kurs') ||
            desc.includes('eğitim') || desc.includes('kitap') || desc.includes('book')) {
            return 'Education';
        }

        // Travel - Seyahat
        if (desc.includes('hotel') || desc.includes('otel') || desc.includes('flight') ||
            desc.includes('uçak') || desc.includes('booking') || desc.includes('thy') ||
            desc.includes('pegasus') || desc.includes('anadolujet') || desc.includes('hostel')) {
            return 'Travel';
        }

        return 'Other';
    };

    const parseTransactionLine = (line: string): Transaction | null => {
        // Ziraat Bankası formatı: "DD/MM/YYYY AÇIKLAMA TUTAR"
        // Örnek: "01/01/2026 SEDAT ARSLAN ÇANAKKALE 80,00"

        // Tarih pattern - DD/MM/YYYY formatı
        const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;

        // Tutar pattern - Satır sonunda virgüllü sayı (Türk formatı)
        // Örnekler: 80,00 veya 3.588,00 veya 12.500,00
        const amountPatterns = [
            /(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/,  // Satır sonu: 3.588,00 veya 80,00
            /(\d+,\d{2})\s*$/,                   // Satır sonu: 80,00
            /(\d{1,3}(?:\.\d{3})*,\d{2})(?:\s|$)/, // Boşluk veya satır sonu
            /(\d+,\d{2})(?:\s|$)/                // Boşluk veya satır sonu
        ];

        let date: string | null = null;
        let amount: number | null = null;
        let description = '';

        // Tarih bul
        const dateMatch = line.match(datePattern);
        if (dateMatch) {
            // DD/MM/YYYY -> YYYY-MM-DD
            date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }

        // Tutar bul
        for (const pattern of amountPatterns) {
            const match = line.match(pattern);
            if (match) {
                let amountStr = match[1];
                // Türk formatı (1.234,56) -> (1234.56)
                amountStr = amountStr.replace(/\./g, '').replace(',', '.');
                amount = parseFloat(amountStr);
                if (amount > 0) break;
            }
        }

        // Açıklama bul (tarih ile tutar arasındaki kısım)
        if (date && amount && amount > 0) {
            // Tarihi kaldır
            let cleanLine = line.replace(datePattern, '').trim();

            // Tutarı kaldır
            for (const pattern of amountPatterns) {
                cleanLine = cleanLine.replace(pattern, '').trim();
            }

            // "İşlemin X/Y Taksiti" gibi ekstra bilgileri kaldır
            cleanLine = cleanLine.replace(/İşlemin\s+\d+\/\d+\s+Taksiti/gi, '').trim();

            description = cleanLine;

            // Eğer açıklama çok kısa veya boşsa, skip et
            if (description.length < 3) {
                return null;
            }

            // Çok uzun açıklamaları kısalt
            if (description.length > 100) {
                description = description.substring(0, 100).trim();
            }

            return {
                date,
                description,
                category: categorizeTransaction(description),
                amount,
                currency: 'TRY'
            };
        }

        return null;
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError(null);
        setFileName(file.name);

        try {
            console.log('📄 Starting PDF parsing...');
            console.log('📄 File name:', file.name);
            console.log('📄 File size:', file.size, 'bytes');

            // PDF'den text çıkar
            const text = await extractTextFromPdf(file);
            console.log('📝 Extracted text length:', text.length);
            console.log('📝 First 1000 characters:', text.substring(0, 1000));

            // Tarih pattern'ine göre böl (DD/MM/YYYY)
            // PDF'den gelen text genelde tek satır olarak geliyor, bu yüzden tarih pattern'ine göre ayırıyoruz
            const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
            const parts: string[] = [];
            let lastIndex = 0;
            let match;

            while ((match = datePattern.exec(text)) !== null) {
                if (lastIndex > 0) {
                    // Önceki tarihten bu tarihe kadar olan kısmı al
                    parts.push(text.substring(lastIndex, match.index));
                }
                lastIndex = match.index;
            }
            // Son kısmı ekle
            if (lastIndex > 0 && lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }

            console.log('📊 Split by dates:', parts.length, 'parts');
            console.log('📊 First 10 parts:', parts.slice(0, 10).map(p => p.substring(0, 100)));

            // Her parçayı parse et
            const transactions: Transaction[] = [];
            let parsedCount = 0;
            let skippedCount = 0;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i].trim();
                if (part.length < 10) continue; // Çok kısa parçaları atla

                const transaction = parseTransactionLine(part);
                if (transaction) {
                    transactions.push(transaction);
                    parsedCount++;
                    if (parsedCount <= 10) {
                        console.log(`✅ Part ${i}: "${part.substring(0, 100)}..." → `, transaction);
                    }
                } else {
                    skippedCount++;
                    if (skippedCount <= 10) {
                        console.log(`⏭️ Part ${i}: "${part.substring(0, 100)}..." (skipped)`);
                    }
                }
            }

            console.log(`\n📊 Summary:`);
            console.log(`✅ Parsed: ${parsedCount} transactions`);
            console.log(`⏭️ Skipped: ${skippedCount} parts`);
            console.log(`📦 All transactions:`, transactions);

            if (transactions.length === 0) {
                setError(`No transactions found. Checked ${parts.length} parts. Open browser console (F12) for details.`);
            } else {
                console.log(`🎉 Success! Found ${transactions.length} transactions`);
                onTransactionsExtracted(transactions);
                setError(null);
            }

        } catch (err: any) {
            console.error('❌ PDF parsing error:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
            setError(`Failed to parse PDF: ${err.message}. Open browser console (F12) for details.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pdf-uploader">
            <div className="upload-header">
                <h3>📄 Upload Bank Statement (PDF)</h3>
                <p className="upload-subtitle">Upload your bank statement PDF to automatically extract transactions</p>
            </div>

            <div className="upload-area">
                <input
                    type="file"
                    id="pdf-upload"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />
                <label htmlFor="pdf-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                    {uploading ? (
                        <>
                            <div className="upload-spinner"></div>
                            <span>Processing PDF...</span>
                        </>
                    ) : (
                        <>
                            <div className="upload-icon">📤</div>
                            <span className="upload-text">
                                {fileName ? `Selected: ${fileName}` : 'Click to upload PDF'}
                            </span>
                            <span className="upload-hint">Supports Turkish bank statements</span>
                        </>
                    )}
                </label>
            </div>

            {error && (
                <div className="upload-error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            <div className="upload-info">
                <h4>💡 Supported Formats:</h4>
                <ul>
                    <li>Turkish bank statements (Garanti, İş Bankası, Akbank, etc.)</li>
                    <li>Date formats: DD/MM/YYYY, DD.MM.YYYY, YYYY-MM-DD</li>
                    <li>Amount formats: 1.234,56 TL or 1,234.56 TL</li>
                </ul>
            </div>
        </div>
    );
}

export default PdfUploader;
