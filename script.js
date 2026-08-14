// --- 1. قاعدة البيانات التجريبية (تتضمن المقاسات والألوان والكميات) ---
const productDatabase = [
    { 
        code: '12345678', 
        name: 'T-Shirt SELEKT Classic', 
        price: 45.000,
        variants: [
            { color: 'أسود', size: 'M', stock: 5 },
            { color: 'أسود', size: 'L', stock: 2 },
            { color: 'أبيض', size: 'XL', stock: 4 },
            { color: 'أزرق', size: 'M', stock: 0 } // غير متوفر
        ]
    },
    { 
        code: '87654321', 
        name: 'Hoodie Black Edition', 
        price: 89.000,
        variants: [
            { color: 'أسود', size: 'L', stock: 3 },
            { color: 'أسود', size: 'XL', stock: 1 },
            { color: 'رمادي', size: 'M', stock: 4 }
        ]
    },
    { 
        code: '6194039501011', 
        name: 'Hoodie Black Edition', 
        price: 89.000,
        variants: [
            { color: 'أسود (Black)', size: 'M', stock: 4 },
            { color: 'أسود (Black)', size: 'L', stock: 2 },
            { color: 'أسود (Black)', size: 'XL', stock: 0 },
            { color: 'كحلي (Navy)', size: 'L', stock: 5 }
        ]
    }
];

let html5QrCode;
let resultElement;

// --- 2. بناء واجهة عرض التفاصيل والمخزون ---
function renderProductInfo(product) {
    // تصفية المتغيرات لعرض المتاح فقط (stock > 0)
    const availableVariants = product.variants ? product.variants.filter(v => v.stock > 0) : [];
    
    let variantsHTML = '';
    
    if (availableVariants.length > 0) {
        variantsHTML = `
            <div style="margin-top: 10px; text-align: right;">
                <strong style="color: #1b5e20;">📦 المقاسات والألوان المتوفرة في المخزون:</strong>
                <ul style="margin: 5px 0; padding-right: 20px; list-style-type: square;">
                    ${availableVariants.map(v => `
                        <li>
                            <span>اللون: <b>${v.color}</b></span> | 
                            <span>المقاس: <b>${v.size}</b></span> 
                            <span style="background: #c8e6c9; color: #2e7d32; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; margin-right: 5px;">
                                المتبقي: ${v.stock} قطعة
                            </span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        variantsHTML = `
            <div style="margin-top: 10px; color: #d32f2f; font-weight: bold;">
                ⚠️ هذا المنتج نَفِدَ من المخزون حالياً (Out of Stock).
            </div>
        `;
    }

    return `
        <div style="background:#e8f5e9; color:#2e7d32; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #c8e6c9; text-align:right;" dir="rtl">
            <h4 style="margin:0 0 5px 0;">✔️ تم التعرف على المنتج</h4>
            <strong>الاسم:</strong> ${product.name}<br>
            <strong>السعر:</strong> ${product.price.toFixed(3)} د.ت<br>
            <strong>الرمز:</strong> <code>${product.code}</code>
            <hr style="border: 0; border-top: 1px solid #a5d6a7; margin: 10px 0;">
            ${variantsHTML}
        </div>
    `;
}

// --- 3. معالجة الكود عند المسح ---
async function onScanSuccess(decodedText) {
    const isDemo = localStorage.getItem('clickmag_demo') !== 'false'; // افتراضي ديمو

    if (isDemo) {
        // البحث في قاعدة البيانات المحلية
        const product = productDatabase.find(p => p.code === decodedText);

        if (product) {
            resultElement.innerHTML = renderProductInfo(product);
        } else {
            resultElement.innerHTML = `
                <div style="background:#fff3e0; color:#ef6c00; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #ffe0b2; text-align:right;" dir="rtl">
                    <h4 style="margin:0 0 5px 0;">⚠️ رمز غير معرف</h4>
                    الرمز الممسوح: <code>${decodedText}</code><br>
                    هذا المنتج غير موجود في القائمة التجريبية.
                </div>
            `;
        }
    } else {
        // --- وضع الاتصال الحقيقي مع ClickMAG ---
        const ip = localStorage.getItem('clickmag_ip');
        const port = localStorage.getItem('clickmag_port');
        
        resultElement.innerHTML = `<div style="padding:10px; text-align:center;">جاري الجلب من حاسوب الكاسة...</div>`;

        try {
            const response = await fetch(`http://${ip}:${port}/api/product/${decodedText}`);
            if (response.ok) {
                const productData = await response.json();
                resultElement.innerHTML = renderProductInfo(productData);
            } else {
                resultElement.innerHTML = `<div style="color:red; padding:10px;">لم يتم العثور على المنتج في ClickMAG</div>`;
            }
        } catch (error) {
            resultElement.innerHTML = `<div style="color:red; padding:10px;">تعذر الاتصال بحاسوب الكاسة. تأكد من الـ IP والشبكة.</div>`;
        }
    }
}

// --- 4. تشغيل الكاميرا المباشرة ---
function startScanner() {
    const supportedFormats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE
    ];

    resultElement = document.getElementById('product-result');

    html5QrCode = new Html5Qrcode("reader", {
        formatsToSupport: supportedFormats,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        }
    });

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

// تشغيل بعد تحميل الصفحة
window.addEventListener('load', () => {
    startScanner();
});

// --- 5. وظائف نافذة الإعدادات ---
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

