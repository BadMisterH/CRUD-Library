import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';


const app = express();
const port = 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new sqlite3.Database('magasin.db');
sqlite3.verbose()

app.use(express.static(path.join(__dirname, 'public')));

//body parser pour traiter les données JSON du corps de la requête
app.use(bodyParser.json());


//##############################
// Afficher la BDD
//#############################

app.get('/livres', (req, res) => {
    db.all('SELECT * FROM livres', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


app.get('/livres/:id', (req, res) => {
    const livresId = req.params.id; // enferme dans une variable l'id de l'elemnt
    db.get('SELECT * FROM livres WHERE id = ?', [livresId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json(row);
        });
});


app.use(express.json());

//MODIFICATION BDD

app.put('/livres/:id', (req, res) => {
    const livresId = req.params.id; // ID du livre à modifier
    const nouveauLivre = req.body; // Nouvelles données du livre

    console.log(`Tentative de modification du livre avec l'ID ${livresId} et les données :`, nouveauLivre);

    // Requête SQL pour mettre à jour le livre
    const sql = `
        UPDATE livres 
        SET name = $name, description = $description, price = $price, stock = $stock 
        WHERE id = $id
    `;

    // Exécution de la requête avec les paramètres
    db.run(
        sql,
        {
            $id: livresId,
            $name: nouveauLivre.name,
            $description: nouveauLivre.description,
            $price: nouveauLivre.price,
            $stock: nouveauLivre.stock,
        },
        //pas de fonction anonyme pour gerer les erreur de modification
        function (err) {
            if (err) {
                // En cas d'erreur, renvoyer un statut 500
                console.error('Erreur lors de la modification du livre :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la modification du livre' });
            }

            // Vérifie si des lignes ont été modifiées
            if (this.changes === 0) {
                console.log('Aucun livre trouvé avec cet ID.');
                return res.status(404).json({ error: 'Aucun livre trouvé avec cet ID.' });
            }

            // Succès
            console.log(`Livre modifié avec succès. Nombre de lignes modifiées : ${this.changes}`);
            res.json({
                message: 'Livre modifié avec succès',
                changes: this.changes, // Nombre de lignes affectées
            });
        }
    );
});


app.delete('/livres/:id', (req, res) => {
    const livresId = req.params.id;

    // Exécution de la requête SQL pour supprimer le livre
    db.run('DELETE FROM livres WHERE id = ?', [livresId], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }
        res.json({ message: 'Livre supprimé avec succès', changes: this.changes });
    })
})


// AJOUT BDD

app.post('/livres', (req, res) => { 
    const nouveauLivre = req.body;
    const sql = 'INSERT INTO livres (name, description, price, stock) VALUES ($name, $description, $price, $stock)';
    db.run(sql, {
        $name: nouveauLivre.name,
        $description: nouveauLivre.description,
        $price: nouveauLivre.price,
        $stock: nouveauLivre.stock,
    }, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Livre ajouté avec succès', id: this.lastID });
    });
});


app.listen(port, () => {
    console.log(`Le serveur ecoute au port ${port}`); 
});
