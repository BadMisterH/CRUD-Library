// Import des modules nécessaires
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

// Initialisation de l'application Express
const app = express();
const port = 3000;

// Création de la connexion à la base de données SQLite
const db = new sqlite3.Database('shop.db');

// Servir les fichiers statiques depuis le dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ajouter le middleware body-parser pour traiter les données JSON du corps de la requête
app.use(bodyParser.json());

// #######################################
// AFFICHER  BDD
// #######################################

// Route pour récupérer les données de la table livres
app.get('/livres', (req, res) => {
  // Exécutez la requête SQL pour sélectionner toutes les lignes de la table livres
  db.all('SELECT * FROM livres', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Envoyez les données en tant que réponse JSON
    res.json(rows);
  });
});

// Route pour récupérer un livre spécifique par ID
app.get('/livres/:id', (req, res) => {
  const livreId = req.params.id;

  // Exécutez la requête SQL pour sélectionner un livre spécifique par ID
  db.get('SELECT * FROM livres WHERE id = ?', [livreId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Si le livre n'est pas trouvé, renvoyez une réponse 404
    if (!row) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Envoyez les données du livre en tant que réponse JSON
    res.json(row);
  });
});

// Middleware pour traiter les données JSON du corps de la requête
app.use(express.json());


// #######################################
// MODIFICATION BDD
// #######################################

// Route pour mettre à jour un livre existant
app.put('/livres/:id', (req, res) => {
  const livreId = req.params.id;
  const nouveauLivre = req.body;

  console.log(`Tentative de modification du livre avec l'ID ${livreId} et les données :`, nouveauLivre);

  // Construire la requête SQL pour mettre à jour le livre
  const sql = `
    UPDATE livres
    SET name = $name, description = $description, price = $price, stock = $stock
    WHERE id = $id
  `;

  // Exécuter la requête SQL avec les paramètres
  db.run(sql, {
    $id: livreId,
    $name: nouveauLivre.name,
    $description: nouveauLivre.description,
    $price: nouveauLivre.price,
    $stock: nouveauLivre.stock,
  }, function (err) {
    if (err) {
      console.error('Erreur lors de la modification du livre:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la modification du livre' });
    }

    console.log(`Livre modifié avec succès. Nombre de lignes modifiées : ${this.changes}`);
    res.json({ message: 'Livre modifié avec succès' });
  });
});

// #######################################
// DELETE BDD
// #######################################

// Route pour supprimer un livre par ID
app.delete('/livres/:id', (req, res) => {
  const livreId = req.params.id;

  // Exécutez la requête SQL pour supprimer le livre
  db.run('DELETE FROM livres WHERE id = ?', [livreId], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression du livre:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression du livre' });
    }

    console.log(`Livre supprimé avec succès. Nombre de lignes supprimées : ${this.changes}`);
    res.json({ message: 'Livre supprimé avec succès' });
  });
});

// #######################################
// AJOUT BDD
// #######################################

// Route pour ajouter un nouveau livre
app.post('/livres', (req, res) => {
  const nouveauLivre = req.body;

  console.log('Tentative d\'ajout du livre avec les données :', nouveauLivre);

  // Construire la requête SQL pour insérer un nouveau livre
  const sql = `
    INSERT INTO livres (name, description, price, stock)
    VALUES ($name, $description, $price, $stock)
  `;

  // Exécuter la requête SQL avec les paramètres
  db.run(sql, {
    $name: nouveauLivre.name,
    $description: nouveauLivre.description,
    $price: nouveauLivre.price,
    $stock: nouveauLivre.stock,
  }, function (err) {
    if (err) {
      console.error('Erreur lors de l\'ajout du livre :', err.message);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du livre' });
    }

    console.log(`Livre ajouté avec succès. ID du nouveau livre : ${this.lastID}`);
    res.json({ message: 'Livre ajouté avec succès', id: this.lastID });
  });
});

// #######################################
// DEMARAGE DU SERVEUR
// #######################################

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
