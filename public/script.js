const formulaireModification = document.getElementById("modificationsFormContainer");
const formulaireAjout = document.getElementById("formulaireAjoutContainer");

const nomLivreModif = document.querySelector('#modifName');
const descriptionLivreModif = document.querySelector('#modifDescription');
const prixLivreModif = document.querySelector('#modifPrice');
const stockLivreModif = document.querySelector('#modifStock');

const tbody = document.querySelector('tbody');
let livreEnCoursDeModificationId;

// Fonction pour créer une ligne dans le tableau
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
  if (!tbody) {
    console.error(`Erreur: Le tbody n'est pas trouvé`);
    return;
  }
  tbody.innerHTML = ''; // Nettoyer le tableau avant d'afficher les données
  livres.forEach(livre => {
    const tr = createTableRow(livre);
    tbody.appendChild(tr);
  });

  // Attacher les événements aux boutons
  document.querySelectorAll('.modifierButton').forEach(button => {
    button.addEventListener('click', function () {
      const livreId = this.getAttribute('data-livre-id');
      chargerLivrePourModification(livreId);
    });
  });

  document.querySelectorAll('.supprimerButton').forEach(button => {
    button.addEventListener('click', function () {
      const livreId = this.getAttribute('data-livre-id');
      supprimerLivre(livreId);
    });
  });
}

// Charger la liste des livres depuis le serveur
function chargerLivres() {
  fetch(`/livres`)
    .then(res => res.json())
    .then(data => afficherLivres(data))
    .catch(error => console.error("Une erreur est survenue lors du chargement des livres", error));
}

// Charger un livre spécifique pour modification
function chargerLivrePourModification(livreId) {
  livreEnCoursDeModificationId = livreId;

  fetch(`/livres/${livreId}`)
    .then(res => {
      if (!res.ok) throw new Error("Erreur lors du chargement du livre");
      return res.json();
    })
    .then(data => remplirFormulaireModification(data))
    .catch(error => console.error("Une erreur est survenue", error));
}

// Remplir le formulaire de modification avec les données du livre
function remplirFormulaireModification(livre) {
  if (nomLivreModif && descriptionLivreModif && prixLivreModif && stockLivreModif) {
    nomLivreModif.value = livre.name;
    descriptionLivreModif.value = livre.description;
    prixLivreModif.value = livre.price;
    stockLivreModif.value = livre.stock;

    formulaireModification.style.display = "block";
  } else {
    console.error('Erreur: Les éléments du formulaire ne sont pas trouvés.');
  }
}

// Soumettre la modification d'un livre
function soumettreFormulaireModification(event) {
  event.preventDefault();

  const nouveauLivre = {
    name: nomLivreModif.value,
    description: descriptionLivreModif.value,
    price: parseFloat(prixLivreModif.value),
    stock: parseInt(stockLivreModif.value),
  };

  fetch(`/livres/${livreEnCoursDeModificationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nouveauLivre),
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur lors de la modification du livre");
      return res.json();
    })
    .then(() => {
      formulaireModification.style.display = "none";
      chargerLivres();
    })
    .catch(error => console.error("Une erreur est survenue lors de la modification", error));
}

// Supprimer un livre
function supprimerLivre(livreId) {
  fetch(`/livres/${livreId}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error("Erreur lors de la suppression du livre");
      return res.json();
    })
    .then(() => chargerLivres())
    .catch(error => console.error("Une erreur est survenue", error));
}

// Ajouter un nouveau livre
function ajouterLivre(event) {
  event.preventDefault();

  const nouveauLivre = {
    name: document.getElementById('addName').value,
    description: document.getElementById('addDescription').value,
    price: parseFloat(document.getElementById('addPrice').value),
    stock: parseInt(document.getElementById('addStock').value),
  };

  fetch('/livres', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nouveauLivre),
  })
    .then(res => {
      if (!res.ok) throw new Error("Erreur lors de l'ajout du livre");
      return res.json();
    })
    .then(() => {
      formulaireAjout.style.display = "none";
      chargerLivres();
    })
    .catch(error => console.error("Une erreur est survenue", error));
}

// Gestion des événements
document.addEventListener('DOMContentLoaded', () => {
  chargerLivres();

  document.getElementById("modificationsForm").addEventListener("submit", soumettreFormulaireModification);
  document.getElementById("addForm").addEventListener("submit", ajouterLivre);

  document.getElementById("add").addEventListener("click", () => {
    formulaireAjout.style.display = "block";
  });

  document.getElementById("closeButton").addEventListener("click", () => {
    formulaireModification.style.display = "none";
  });
});
