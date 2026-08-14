// --- 1. المتغيرات العامة وقاعدة البيانات التجريبية ---
let html5QrCode;
let resultElement;
let isTorchOn = false;

const productDatabase = [
    { 
        code: '12345678', 
        name: 'T-Shirt SELEKT Classic', 
        price: 45.000,
        variants: [
            { color: 'أسود', size: 'M', stock: 5 },
            { color: 'أسود', size: 'L', stock: 2 },
            { color: 'أبيض', size: 'XL', stock: 4 }
        ]
    },
    { 
        code: '6194039501011', 
        name: 'Hoodie Black Edition', 
        price: 89.000,
        variants: [
            { color: 'أسود', size: 'M', stock: 4 },
            { color: 'أسود', size: 'L', stock: 2 },
            { color: 'كحلي', size: 'L', stock: 5 }
        ]
    }
];

// --- 2. وظيفة عرض النتائج والمخزون ---
function renderProductInfo(product) {
    const availableVariants = product.variants ? product.variants.filter(v => v.stock > 0) : [];
    let variantsHTML = '';
    
    if (availableVariants.length > 0) {
        variantsHTML = `
            <div style="margin-top: 10px; text-align: right;">
                <strong style="color: #1b5e20;">📦 المتاح في المخزون:</strong>
                <ul style="margin: 5px 0; padding-right: 20px; list-style-type: square;">
                    ${availableVariants.map(v => `
                        <li>اللون: <b>${v.color}</b> | المقاس: <b>${v.size}</b> | المتبقي: <b>${v.stock}</b></li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        variantsHTML = `<div style="margin-top: 10px; color: #d32f2f; font-weight: bold;">⚠️ المنتج نَفِدَ من المخزون.</div>`;
    }

    return `
        <div style="background:#e8f5e9; color:#2e7d32; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #c8e6c9; text-align:right;" dir="rtl">
            <h4 style="margin:0 0 5px 0;">✔️ تم العثور على المنتج</h4>
            <strong>الاسم:</strong> ${product.name}<br>
            <strong>السعر:</strong> ${product.price.toFixed(3)} د.ت<br>
            <strong>الرمز:</strong> <code>${product.code}</code>
            <hr style="border: 0; border-top: 1px solid #a5d6a7; margin: 10px 0;">
            ${variantsHTML}
        </div>
    `;
}

// --- 3. المنطق الأساسي للبحث (سواء عبر الكاميرا أو يدوياً) ---
async function onScanSuccess(decodedText) {
    const isDemo = localStorage.getItem('clickmag_demo') !== 'false';

    if (isDemo) {
        const product = productDatabase.find(p => p.code === decodedText);
        resultElement.innerHTML = product ? renderProductInfo(product) : 
            `<div style="background:#fff3e0; color:#ef6c00; padding:15px; border-radius:8px; margin-top:10px; text-align:right;" dir="rtl">⚠️ المنتج ${decodedText} غير موجود في الديمو.</div>`;
    } else {
        const ip = localStorage.getItem('clickmag_ip');
        const port = localStorage.getItem('clickmag_port');
        try {
            const response = await fetch(`http://${ip}:${port}/api/product/${decodedText}`);
            const productData = await response.json();
            resultElement.innerHTML = renderProductInfo(productData);
        } catch (error) {
            resultElement.innerHTML = `<div style="color:red; padding:10px;">خطأ في الاتصال بالحاسوب.</div>`;
        }
    }
}

// --- 4. الوظائف الجديدة: الكشاف والبحث اليدوي ---
function manualSearch() {
    const code = document.getElementById('manual-code').value;
    if (code) onScanSuccess(code);
    else alert("يرجى إدخال الكود");
}

function toggleFlashlight() {
    if (!html5QrCode) return;
    html5QrCode.applyVideoConstraints({
        advanced: [{ torch: !isTorchOn }]
    }).then(() => {
        isTorchOn = !isTorchOn;
        const btn = document.getElementById('torch-btn');
        btn.innerText = isTorchOn ? "🛑 إطفاء الكشاف" : "🔦 تشغيل الكشاف";
        btn.style.background = isTorchOn ? "#d32f2f" : "#ff9800";
    }).catch(err => alert("الكشاف غير مدعوم في هذا المتصفح"));
}

// --- 5. تهيئة الماسح ---
function startScanner() {
    resultElement = document.getElementById('product-result');
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 150 } }, 
        onScanSuccess
    ).catch(err => console.error(err));
}

// --- 6. الإعدادات ---
function openSettingsModal() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettingsModal() { document.getElementById('settings-modal').style.display = 'none'; }
function saveConfig() {
    localStorage.setItem('clickmag_ip', document.getElementById('cfg-ip').value);
    localStorage.setItem('clickmag_port', document.getElementById('cfg-port').value);
    localStorage.setItem('clickmag_demo', document.getElementById('cfg-demo').checked);
    alert("تم الحفظ!");
    closeSettingsModal();
}

// التشغيل عند التحميل
window.addEventListener('load', () => {
    startScanner();
    // تحميل الإعدادات القديمة لو موجودة
    document.getElementById('cfg-ip').value = localStorage.getItem('clickmag_ip') || '';
    document.getElementById('cfg-port').value = localStorage.getItem('clickmag_port') || '';
    document.getElementById('cfg-demo').checked = localStorage.getItem('clickmag_demo') === 'true';
});


