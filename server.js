const express = require('express');
const cors = require('cors');
const odbc = require('odbc');

const app = express();
app.use(cors());
app.use(express.json());

// سلسلة الاتصال بقاعدة بيانات HFSQL المحلية
// استبدل العناوين واسم قاعدة البيانات حسب إعدادات HFSQL Control Center لديكم
const connectionString = "DRIVER={HFSQL};Server Name=localhost;Server Port=4900;Database=ClickMAG_DB;UID=admin;PWD=;";

// مسار الاستعلام عن المنتج بالباركود
app.get('/api/product/:barcode', async (req, res) => {
    const barcode = req.params.barcode;
    
    try {
        const connection = await odbc.connect(connectionString);
        
        // استعلام يجلب بيانات المنتج والمقاس واللون والكمية المتبقية لحظياً
        const query = `
            SELECT 
                A.Reference AS reference,
                A.Designation AS designation,
                TC.Taille AS taille,
                TC.Couleur AS couleur,
                TC.QuantiteStock AS stock,
                TC.PrixVente AS prix
            FROM TaillesCouleurs TC
            INNER JOIN Articles A ON TC.IDArticle = A.IDArticle
            WHERE TC.CodeBarre = '${barcode}'
        `;

        const result = await connection.query(query);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, product: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }
    } catch (error) {
        console.error('خطأ في قاعدة البيانات:', error);
        res.status(500).json({ success: false, message: 'خطأ في الاتصال بقاعدة البيانات' });
    }
});

// تشغيل الخادم على المنفذ 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

