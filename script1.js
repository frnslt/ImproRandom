import { database } from './database.js'; // Importa il database dal file separato

// Variabili per la password
const PASSWORD = "securepassword123";
let isAuthenticated = false;

// Elementi della UI
const outputDiv = document.getElementById("output");
const generateButton = document.getElementById("generate");
const editDatabaseButton = document.getElementById("edit-database");
const formContainer = document.getElementById("form-container");
const categorySelect = document.getElementById("category");
const newItemInput = document.getElementById("new-item");
const addItemButton = document.getElementById("add-item");

// Funzione per generare output random unico
function generateOutput() {
  const selectedOption = document.querySelector('input[name="option"]:checked').value;
  const quantity = selectedOption === "personaggi" ? parseInt(document.getElementById("quantity").value) : 1;

  const selectedList = database[selectedOption];
  const randomItems = getRandomUniqueItems(selectedList, quantity);

  outputDiv.textContent = randomItems.join(", ");
}

// Listener sul bottone Genera
generateButton.addEventListener("click", generateOutput);

// Listener per il tasto Invio
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateOutput();
  }
});

// Listener sul bottone Modifica Database
editDatabaseButton.addEventListener("click", () => {
  if (!isAuthenticated) {
    const enteredPassword = prompt("Inserisci la password per modificare il database:");
    if (enteredPassword === PASSWORD) {
      isAuthenticated = true;
      alert("Accesso consentito. Puoi ora modificare il database.");
      formContainer.classList.remove("hidden");
    } else {
      alert("Password errata. Accesso negato.");
    }
  } else {
    formContainer.classList.toggle("hidden");
  }
});

// Listener sul bottone Aggiungi
addItemButton.addEventListener("click", () => {
  const category = categorySelect.value;
  const newItem = newItemInput.value.trim();

  if (newItem) {
    database[category].push(newItem);
    alert(`Elemento aggiunto alla categoria ${category}: "${newItem}"`);
    newItemInput.value = ""; // Svuota il campo di input
  } else {
    alert("Inserisci un elemento valido.");
  }
});

function getRandomUniqueItems(array, count) {
  const availableItems = [...array];
  const selectedItems = [];

  for (let i = 0; i < count && availableItems.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    selectedItems.push(availableItems.splice(randomIndex, 1)[0]);
  }

  return selectedItems;
}
