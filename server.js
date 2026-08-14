const express = require('express');
const cors = require('cors');
const odbc = require('odbc');

const app = express();
app.use(cors());
app.use(express.json());

// سلسلة الاتصال بقاعدة بيانات HFSQL (تأكد من مطابقتها لإعداداتك)
const connectionString = "DRIVER={HFSQL};Server Name=localhost;Server Port=4900;Database=ClickMAG_DB;UID=admin;PWD=;";

// مسار جلب البيانات (الذي ينادي عليه التطبيق في الهاتف)
app.get('/api/product/:barcode', async (req, res) => {
    const barcode = req.params.barcode;

    try {
        const connection = await odbc.connect(connectionString);
        
        // الاستعلام لجلب البيانات
        const query = `
            SELECT A.Designation, TC.Taille, TC.Couleur, TC.QuantiteStock 
            FROM TaillesCouleurs TC 
            INNER JOIN Articles A ON TC.IDArticle = A.IDArticle 
            WHERE TC.CodeBarre = '${barcode}'
        `;

        const result = await connection.query(query);
        await connection.close();

        if (result.length > 0) {
            // تجميع البيانات في الهيكل الذي يتوقعه كود الجافا سكريبت (Frontend)
            const product = {
                name: result[0].Designation,
                variants: result.map(row => ({
                    color: row.Couleur,
                    size: row.Taille,
                    quantity: row.QuantiteStock
                }))
            };
            res.json(product);
        } else {
            res.status(404).json({ message: "Produit non trouvé" });
        }
    } catch (error) {
        console.error('Erreur base de données:', error);
        res.status(500).json({ message: "Erreur de connexion au serveur" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server ClickMAG démarré sur http://localhost:${PORT}`);
});
