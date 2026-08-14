// --- 1. قاعدة البيانات التجريبية (Demo Mode) ---
const productDatabase = [
    { code: '12345678', name: 'T-Shirt SELEKT Classic', price: 45.000 },
    { code: '87654321', name: 'Hoodie Black Edition', price: 89.000 },
    { code: '11223344', name: 'Cargo Pants Oversized', price: 65.000 },
    { code: '55667788', name: 'Cap SELEKT Logo', price: 25.000 }
];

// --- 2. إعداد مكتبة html5-qrcode وتحديد أنواع الباركود المطلوبة ---
const supportedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.QR_CODE
];

const html5QrCode = new Html5Qrcode("reader", {
    formatsToSupport: supportedFormats,
    experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
    }
});

const resultElement = document.getElementById('product-result');

// --- 3. دالة معالجة الكود عند العثور عليه ---
function onScanSuccess(decodedText) {
    const isDemo = document.getElementById('cfg-demo')?.checked;
    
    // البحث عن المنتج في قاعدة البيانات المحلية
    const product = productDatabase.find(p => p.code === decodedText);

    if (product) {
        resultElement.innerHTML = `
            <div style="background:#e8f5e9; color:#2e7d32; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #c8e6c9;">
                <h4 style="margin:0 0 5px 0;">✔️ تم التعرف على المنتج</h4>
                <strong>الاسم:</strong> ${product.name}<br>
                <strong>السعر:</strong> ${product.price.toFixed(3)} د.ت<br>
                <strong>الرمز:</strong> <code>${product.code}</code>
            </div>
        `;
    } else {
        resultElement.innerHTML = `
            <div style="background:#fff3e0; color:#ef6c00; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #ffe0b2;">
                <h4 style="margin:0 0 5px 0;">⚠️ رمز غير معرف</h4>
                الرمز الممسوح: <code>${decodedText}</code><br>
                هذا المنتج غير موجود في القائمة التجريبية.
            </div>
        `;
    }
}

// --- 4. تشغيل الكاميرا المباشرة ---
function startScanner() {
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        formatsToSupport: supportedFormats
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(err => {
        console.error("خطأ في تشغيل الكاميرا:", err);
    });
}

// تشغيل الكاميرا تلقائياً عند فتح الصفحة
window.addEventListener('load', () => {
    startScanner();
});

// --- 5. وظائف نافذة الإعدادات (Modal) ---
function openSettingsModal() {
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveConfig() {
    const ip = document.getElementById('cfg-ip').value;
    const port = document.getElementById('cfg-port').value;
    const isDemo = document.getElementById('cfg-demo').checked;

    localStorage.setItem('clickmag_ip', ip);
    localStorage.setItem('clickmag_port', port);
    localStorage.setItem('clickmag_demo', isDemo);

    alert("تم حفظ الإعدادات بنجاح!");
    closeSettingsModal();
}
