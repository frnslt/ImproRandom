// Lettura dinamica del file database dal repository
let database = {}; // Variabile globale per memorizzare i dati del database

async function fetchDatabase() {
  const repoOwner = 'frnslt'; // Tuo username GitHub
  const repoName = 'ImproRandom'; // Nome del repository
  const filePath = 'database.js'; // Percorso del file nel repository
  const branch = 'main'; // Branch principale

  const url = // `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
    'https://raw.githubusercontent.com/frnslt/ImproRandom/main/database.js'; // URL grezzo del file
  
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore nella lettura del file: ${response.statusText}`);
    }

    const fileContent = await response.text();
    console.log("Contenuto del file recuperato:", fileContent); // Log per debug

    // Crea un contesto isolato per valutare il file
    const databaseInitializer = new Function(`
      ${fileContent}
      return database;
    `);

    database = databaseInitializer();
    console.log("Database inizializzato correttamente:", database); // Verifica il contenuto di `database`
  } catch (error) {
    console.error('Errore nel caricamento del database:', error);
  }
  
    // Esegue il contenuto del file
  //  eval(fileContent); 
  //  console.log('Database caricato con successo:', database);
  //} catch (error) {
  //  console.error('Errore nel caricamento del database:', error);
 // }
}

// Richiamare fetchdatabase() prima dell'uso
fetchDatabase().then(() => {
  // Qui puoi iniziare a eseguire altre funzioni che dipendono da `database`
  console.log('Applicazione pronta all\'uso.');
});

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
   console.log('Opzione selezionata:', selectedOption); // Log per debug
  const quantity = selectedOption === "personaggi" ? parseInt(document.getElementById("quantity").value) : 1;
  
  console.log('Contenuto del database:', database); // Log per debug
  
  const selectedList = database[selectedOption];
  console.log('Lista selezionata:', selectedList); // Log per debug
  
  if (!Array.isArray(selectedList)) {
    console.error(`Errore: la lista selezionata (${selectedOption}) non è un array o non esiste.`, selectedList);
    alert(`Errore: non posso generare elementi perché la lista selezionata (${selectedOption}) non è valida.`);
    return;
  }

  if (selectedOption === "personaggi") {
    const randomItems = getRandomUniqueItems(selectedList, quantity);
    outputDiv.textContent = randomItems.join(", ");
  } else {
    const randomItem = selectedList[Math.floor(Math.random() * selectedList.length)];
    outputDiv.textContent = randomItem;
  }
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
editDatabaseButton.addEventListener("click", async () => {
  // Carica il database
  await fetchDatabase();

  const enteredPassword = prompt("Inserisci la password per modificare il database:");
  if (enteredPassword === PASSWORD) {
    isAuthenticated = true;
    alert("Accesso consentito. Puoi ora modificare il database.");
    document.getElementById("form-container").classList.remove("hidden");
  } else {
    alert("Password errata. Accesso negato.");
  }
});

// Listener sul bottone Aggiungi
addItemButton.addEventListener("click", async () => {
  const category = document.getElementById("category").value;
  const newItem = document.getElementById("new-item").value.trim();

  if (newItem) {
    await fetchDatabase(); // Carica il database aggiornato

    database[category].push(newItem); // Aggiungi l'elemento localmente

    // Aggiorna il file nel repository
    const newDatabaseContent = `export const database = ${JSON.stringify(database, null, 2)};`;
    await updateDatabaseFile(newDatabaseContent);

    document.getElementById("new-item").value = ""; // Svuota il campo di input
  } else {
    alert("Inserisci un elemento valido.");
  }  
});

// Scrittura del database
async function updateDatabaseFile(newDatabaseContent) {
  const repoOwner = 'frnslt';
  const repoName = 'ImproRandom';
  const filePath = 'database.js';
  const branch = 'main';
  const token = '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'; // Dovrei usare un token protetto lato server per sicurezza, ma ops

  const url = // `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branch}`;
    'https://raw.githubusercontent.com/frnslt/ImproRandom/main/database.js'; // URL grezzo del file
  
  try {
    // Ottieni l'SHA del file esistente
    const getResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Errore nel recupero del file: ${getResponse.statusText}`);
    }

    const { sha } = await getResponse.json();

    // Scrivi il nuovo contenuto del file
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: 'Aggiornamento database.js',
        content: btoa(newDatabaseContent), // Codifica Base64 del nuovo contenuto
        sha: sha,
        branch: branch,
      }),
    });

    if (!putResponse.ok) {
      throw new Error(`Errore nella scrittura del file: ${putResponse.statusText}`);
    }

    alert('Database aggiornato con successo!');
  } catch (error) {
    console.error('Errore nell\'aggiornamento del database:', error);
  }
}

// funzione add per generare output random unico
function getRandomUniqueItems(array, count) {
  const availableItems = [...array];
  const selectedItems = [];

  for (let i = 0; i < count && availableItems.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    selectedItems.push(availableItems.splice(randomIndex, 1)[0]);
  }

  return selectedItems;
}
