// ==========================================
// 1. إدارة الإعدادات والحفظ
// ==========================================
const DEFAULT_CONFIG = { 
    ip: "192.168.1.15", 
    port: "4900", 
    useDemo: true 
};

function getConfig() { 
    return JSON.parse(localStorage.getItem('forYou_app_config')) || DEFAULT_CONFIG; 
}

function saveConfig() {
    const config = { 
        ip: document.getElementById('cfg-ip').value, 
        port: document.getElementById('cfg-port').value, 
        useDemo: document.getElementById('cfg-demo').checked 
    };
    localStorage.setItem('forYou_app_config', JSON.stringify(config));
    alert("Enregistré avec succès !");
    closeSettingsModal();
}

function openSettingsModal() {
    const config = getConfig();
    document.getElementById('cfg-ip').value = config.ip;
    document.getElementById('cfg-port').value = config.port;
    document.getElementById('cfg-demo').checked = config.useDemo;
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettingsModal() { 
    document.getElementById('settings-modal').style.display = 'none'; 
}

// ==========================================
// 2. البحث وجلب البيانات
// ==========================================
async function fetchProductDetails(barcode) {
    const config = getConfig();
    const resDiv = document.getElementById('product-result');
    resDiv.innerHTML = "<p>Recherche en cours...</p>";

    if (config.useDemo) {
        // بيانات تجريبية للتأكد من عمل التطبيق
        const demoData = { 
            "468": { name: "Chemise Classique", variants: [{ color: "Bleu", size: "M", quantity: 4 }, { color: "Noir", size: "XL", quantity: 2 }] }, 
            "275": { name: "Jean Classique", variants: [{ color: "Gris", size: "40", quantity: 2 }] } 
        };
        
        if (demoData[barcode]) {
            renderCard(demoData[barcode]);
        } else {
            resDiv.innerHTML = `<p style="color: #e65100;">⚠️ Produit (${barcode}) non trouvé en mode démo.</p>`;
        }
    } else {
        // الاتصال المباشر بالكاشة
        try {
            const res = await fetch(`http://${config.ip}:${config.port}/api/product/${barcode}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            renderCard(data);
        } catch(e) { 
            resDiv.innerHTML = `<p style="color: red;">⚠️ Erreur de connexion avec la caisse (${config.ip}:${config.port})</p>`; 
        }
    }
}

// ==========================================
// 3. طباعة البيانات على الشاشة
// ==========================================
function renderCard(p) {
    document.getElementById('product-result').innerHTML = `
        <div class="product-card">
            <div class="product-title">${p.name}</div>
            ${p.variants.map(v => `
                <div class="stock-info">
                    <strong>Couleur:</strong> ${v.color} | 
                    <strong>Taille:</strong> ${v.size} | 
                    <strong>Qté:</strong> ${v.quantity}
                </div>
            `).join('')}
        </div>`;
}

// ==========================================
// 4. تشغيل الكاميرا والماسح الضوئي
// ==========================================
window.addEventListener("load", () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render((text) => fetchProductDetails(text));
});

