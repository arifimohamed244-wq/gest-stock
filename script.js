// --- 1. Variables globales et base de données de démo ---
let html5QrCode;
let resultElement;
let isTorchOn = false;

const productDatabase = [
    { 
        code: '12345678', 
        name: 'T-Shirt SELEKT Classic', 
        price: 45.000,
        variants: [
            { color: 'Noir', size: 'M', stock: 5 },
            { color: 'Noir', size: 'L', stock: 2 },
            { color: 'Blanc', size: 'XL', stock: 4 }
        ]
    },
    { 
        code: '6194039501011', 
        name: 'Hoodie Black Edition', 
        price: 89.000,
        variants: [
            { color: 'Noir', size: 'M', stock: 4 },
            { color: 'Noir', size: 'L', stock: 2 },
            { color: 'Bleu Marine', size: 'L', stock: 5 }
        ]
    }
];

// --- 2. Fonction d'affichage des détails du produit ---
function renderProductInfo(product) {
    const availableVariants = product.variants ? product.variants.filter(v => v.stock > 0) : [];
    let variantsHTML = '';
    
    if (availableVariants.length > 0) {
        variantsHTML = `
            <div style="margin-top: 10px; text-align: left;">
                <strong style="color: #1b5e20;">📦 En stock (Tailles & Couleurs disponibles) :</strong>
                <ul style="margin: 5px 0; padding-left: 20px; list-style-type: square;">
                    ${availableVariants.map(v => `
                        <li>Couleur : <b>${v.color}</b> | Taille : <b>${v.size}</b> | Reste : <b>${v.stock} pcs</b></li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        variantsHTML = `<div style="margin-top: 10px; color: #d32f2f; font-weight: bold;">⚠️ Produit en rupture de stock.</div>`;
    }

    return `
        <div style="background:#e8f5e9; color:#2e7d32; padding:15px; border-radius:8px; margin-top:10px; border:1px solid #c8e6c9; text-align:left;" dir="ltr">
            <h4 style="margin:0 0 5px 0;">✔️ Produit trouvé</h4>
            <strong>Nom :</strong> ${product.name}<br>
            <strong>Prix :</strong> ${product.price.toFixed(3)} DT<br>
            <strong>Code :</strong> <code>${product.code}</code>
            <hr style="border: 0; border-top: 1px solid #a5d6a7; margin: 10px 0;">
            ${variantsHTML}
        </div>
    `;
}

// --- 3. Logique de recherche (Caméra ou Manuel) ---
async function onScanSuccess(decodedText) {
    const isDemo = localStorage.getItem('clickmag_demo') !== 'false';

    if (isDemo) {
        const product = productDatabase.find(p => p.code === decodedText);
        resultElement.innerHTML = product ? renderProductInfo(product) : 
            `<div style="background:#fff3e0; color:#ef6c00; padding:15px; border-radius:8px; margin-top:10px; text-align:left;" dir="ltr">⚠️ Le produit avec le code <code>${decodedText}</code> n'existe pas en mode démo.</div>`;
    } else {
        const ip = localStorage.getItem('clickmag_ip');
        const port = localStorage.getItem('clickmag_port');
        resultElement.innerHTML = `<div style="padding:10px; text-align:center;">Recherche dans ClickMAG...</div>`;

        try {
            const response = await fetch(`http://${ip}:${port}/api/product/${decodedText}`);
            if(response.ok) {
                const productData = await response.json();
                resultElement.innerHTML = renderProductInfo(productData);
            } else {
                resultElement.innerHTML = `<div style="color:red; padding:10px;">Produit non trouvé dans ClickMAG.</div>`;
            }
        } catch (error) {
            resultElement.innerHTML = `<div style="color:red; padding:10px;">Erreur de connexion à la caisse. Vérifiez l'IP et le réseau.</div>`;
        }
    }
}

// --- 4. Fonctions Recherche Manuelle et Lampe Torche ---
function manualSearch() {
    const code = document.getElementById('manual-code').value.trim();
    if (code) {
        onScanSuccess(code);
    } else {
        alert("Veuillez saisir un code à barre.");
    }
}

function toggleFlashlight() {
    if (!html5QrCode) return;
    html5QrCode.applyVideoConstraints({
        advanced: [{ torch: !isTorchOn }]
    }).then(() => {
        isTorchOn = !isTorchOn;
        const btn = document.getElementById('torch-btn');
        btn.innerText = isTorchOn ? "🛑 Désactiver la lampe" : "🔦 Activer la lampe";
        btn.style.background = isTorchOn ? "#d32f2f" : "#ff9800";
    }).catch(err => alert("La lampe n'est pas supportée sur cet appareil ou navigateur."));
}

// --- 5. Initialisation du Scanner ---
function startScanner() {
    resultElement = document.getElementById('product-result');
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 150 } }, 
        onScanSuccess
    ).catch(err => console.error("Erreur caméra :", err));
}

// --- 6. Gestion des Paramètres ---
function openSettingsModal() { document.getElementById('settings-modal').style.display = 'flex'; }
function closeSettingsModal() { document.getElementById('settings-modal').style.display = 'none'; }

function saveConfig() {
    localStorage.setItem('clickmag_ip', document.getElementById('cfg-ip').value);
    localStorage.setItem('clickmag_port', document.getElementById('cfg-port').value);
    localStorage.setItem('clickmag_demo', document.getElementById('cfg-demo').checked);
    alert("Paramètres enregistrés avec succès !");
    closeSettingsModal();
}

// Lancement automatique lors du chargement de la page
window.addEventListener('load', () => {
    startScanner();
    // Charger les anciens paramètres s'ils existent
    document.getElementById('cfg-ip').value = localStorage.getItem('clickmag_ip') || '';
    document.getElementById('cfg-port').value = localStorage.getItem('clickmag_port') || '';
    document.getElementById('cfg-demo').checked = localStorage.getItem('clickmag_demo') !== 'false';
});



