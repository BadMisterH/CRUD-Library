// Déclaration des constantes pour les éléments du DOM
const formulaireModification = document.getElementById("formulaireModification");
const closeButton = document.getElementById("closeButton");
const nomLivreModif = document.querySelector('#nomLivreModif');
const descriptionLivreModif = document.querySelector('#descriptionLivreModif');
const prixLivreModif = document.querySelector('#prixLivreModif');
const stockLivreModif = document.querySelector('#stockLivreModif');
let livreEnCoursDeModificationId;

// Récupérer la référence de la tbody dans le tableau
const tbody = document.querySelector('tbody');

// Fonction pour créer une ligne HTML avec les données du livre
function createTableRow(livre) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${livre.id}</td>
    <td>${livre.name}</td>
    <td>${livre.description}</td>
    <td>${livre.price}</td>
    <td>${livre.stock}</td>
    <td>
      <a href="#" class="modifierButton" data-livre-id="${livre.id}">Modifier</a>
      <a href="#" class="supprimerButton" data-livre-id="${livre.id}">Supprimer</a>
    </td>
  `;
  return tr;
}

// Fonction pour afficher les livres dans le tableau
function afficherLivres(livres) {
  // Vérifier si tbody existe
  if (!tbody) {
    console.error('Erreur: tbody non trouvé dans le document.');
    return;
  }

  // Supprimer le contenu actuel de tbody
  tbody.innerHTML = '';

  // Ajouter chaque livre à la table
  livres.forEach(livre => {
    const tr = createTableRow(livre);
    tbody.appendChild(tr);
  });

  // Ajouter des écouteurs d'événements pour les boutons "Modifier"
  const modifierButtons = document.querySelectorAll('.modifierButton');
  modifierButtons.forEach(button => {
    button.addEventListener('click', function () {
      const livreId = this.getAttribute('data-livre-id');
      chargerLivrePourModification(livreId);
    });
  });

  // Ajouter des écouteurs d'événements pour les boutons "Supprimer"
  attacherEcouteursSupprimer();
}

// Fonction pour charger les livres depuis le serveur
function chargerLivres() {
  fetch('/livres')
    .then(response => response.json())
    .then(data => afficherLivres(data))
    .catch(error => console.error('Erreur lors du chargement des livres:', error));
}

// Charger les livres au chargement de la page
document.addEventListener('DOMContentLoaded', function () {
  // Ajouter un écouteur d'événements pour le bouton de fermeture
  closeButton.addEventListener("click", function () {
    formulaireModification.style.display = "none";
  });

  // Écouter également le clic à côté de la modale pour la fermer
  window.addEventListener("click", function (event) {
    if (event.target === formulaireModification) {
      formulaireModification.style.display = "none";
    }
  });

  // Charger les livres au chargement de la page après avoir défini les écouteurs d'événements
  chargerLivres();
});

// #######################################
// MODIFICATION BDD
// #######################################

// Fonction pour charger un livre spécifique pour la modification
function chargerLivrePourModification(livreId) {
  livreEnCoursDeModificationId = livreId;

  fetch(`/livres/${livreId}`)
    .then(response => {
      if (!response.ok) {
        console.error('Réponse du serveur non OK:', response);
        throw new Error('Erreur lors de la récupération du livre');
      }
      return response.json();
    })
    .then(data => {
      // Remplir le formulaire de modification avec les données du livre
      remplirFormulaireModification(data);
    })
    .catch(error => console.error('Erreur lors du chargement du livre:', error));
}



// Fonction pour remplir le formulaire de modification
function remplirFormulaireModification(livre) {
  // Vérifier si les éléments existent avant de les manipuler
  console.log(nomLivreModif, descriptionLivreModif, prixLivreModif, stockLivreModif);
  if (nomLivreModif && descriptionLivreModif && prixLivreModif && stockLivreModif) {
    // Remplir les champs du formulaire avec les données du livre
    nomLivreModif.value = livre.name;
    descriptionLivreModif.value = livre.description;
    prixLivreModif.value = livre.price;
    stockLivreModif.value = livre.stock;

    // Afficher la modale de modification
    formulaireModification.style.display = "block";
  } else {
    console.error('Erreur: Les éléments du formulaire ne sont pas trouvés dans le document.');
  }
}

// #######################################
// DELETE BDD
// #######################################

// Fonction pour attacher les écouteurs d'événements pour les boutons "Supprimer"
function attacherEcouteursSupprimer() {
  const supprimerButtons = document.querySelectorAll('.supprimerButton');
  supprimerButtons.forEach(button => {
    button.addEventListener('click', function () {
      const livreId = this.getAttribute('data-livre-id');
      supprimerLivre(livreId);
    });
  });
}

// Fonction pour supprimer un livre de la base de données
function supprimerLivre(livreId) {
  fetch(`/livres/${livreId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (!response.ok) {
        console.error('Réponse du serveur non OK lors de la suppression:', response);
      }
      return response.json();
    })
    .then(data => {
      console.log('Livre supprimé avec succès:', data);
      // Rafraîchir la liste des livres après la suppression
      chargerLivres();
    })
    .catch(error => console.error('Erreur lors de la suppression du livre:', error));
}


// #######################################
// MODIFICATION BDD
// #######################################

// Fonction pour soumettre le formulaire de modification
function soumettreFormulaireModification(livreId, nouveauLivre) {
  fetch(`/livres/${livreId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nouveauLivre),
  })
    .then(response => {
      if (!response.ok) {
        console.error('Réponse du serveur non OK lors de la modification:', response);
        throw new Error('Erreur lors de la modification du livre');
      }
      return response.json();
    })
    .then(data => {
      console.log('Livre modifié avec succès:', data);
      // Rafraîchir la liste des livres après la modification
      chargerLivres();
      // Cacher le formulaire de modification
      formulaireModification.style.display = "none";
    })
    .catch(error => console.error('Erreur lors de la modification du livre:', error));
}

// Écouter le soumission du formulaire de modification
const modificationForm = document.getElementById("formulaireModification");
modificationForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const nouveauLivre = {
    name: nomLivreModif.value,
    description: descriptionLivreModif.value,
    price: parseFloat(prixLivreModif.value),
    stock: parseInt(stockLivreModif.value),
  };
  // Appeler la fonction pour soumettre le formulaire de modification
  soumettreFormulaireModification(livreEnCoursDeModificationId, nouveauLivre);
});


// #######################################
// AJOUT BDD
// #######################################

// Fonction pour ajouter un livre à la base de données
function ajouterLivre(nouveauLivre) {
  fetch('/livres', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nouveauLivre),
  })
    .then(response => {
      if (!response.ok) {
        console.error('Réponse du serveur non OK lors de l\'ajout:', response);
        throw new Error('Erreur lors de l\'ajout du livre');
      }
      return response.json();
    })
    .then(data => {
      console.log('Livre ajouté avec succès:', data);
      // Rafraîchir la liste des livres après l'ajout
      chargerLivres();
      // Cacher le formulaire d'ajout
      formulaireAjout.style.display = "none";
    })
    .catch(error => console.error('Erreur lors de l\'ajout du livre:', error));
}

// Écouter le soumission du formulaire d'ajout
const formulaireAjout = document.getElementById("formulaireAjout");
formulaireAjout.addEventListener('submit', function (event) {
  event.preventDefault();
  const nouveauLivre = {
    name: document.getElementById('nomLivre').value,
    description: document.getElementById('descriptionLivre').value,
    price: parseFloat(document.getElementById('prixLivre').value),
    stock: parseInt(document.getElementById('stockLivre').value),
  };
  // Appeler la fonction pour ajouter le livre
  ajouterLivre(nouveauLivre);
});

// Écouter le clic sur le bouton "Ajouter un livre"
document.getElementById('ajouter').addEventListener('click', function () {
  formulaireAjout.style.display = "block";
});
