// Elementi della UI
const generateButton = document.getElementById("generate");
const outputDiv = document.getElementById("output");
const editDatabaseButton = document.getElementById("edit-database");
const formContainer = document.getElementById("form-container");
const addItemButton = document.getElementById("add-item");
const PASSWORD = "securepassword123";

// Funzione per caricare dinamicamente i file delle liste
async function loadList(option) {
  const url = `https://raw.githubusercontent.com/frnslt/ImproRandom/main/${option}.js`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Errore nel caricamento di ${option}: ${response.statusText}`);
    }

    const fileContent = await response.text();
    const listInitializer = new Function(`
      ${fileContent}
      return ${option};
    `);

    return listInitializer();
  } catch (error) {
    console.error(`Errore nel caricamento della lista ${option}:`, error);
    return [];
  }
}

// Funzione per generare output random unico
async function generateOutput() {
  const selectedOption = document.querySelector('input[name="option"]:checked').value;
  const quantity = selectedOption === "personaggi" ? parseInt(document.getElementById("quantity").value) : 1;

  const selectedList = await loadList(selectedOption);
  if (!Array.isArray(selectedList)) {
    alert(`Errore: impossibile caricare la lista per ${selectedOption}.`);
    return;
  }

  const randomItems =
    selectedOption === "personaggi"
      ? getRandomUniqueItems(selectedList, quantity)
      : [selectedList[Math.floor(Math.random() * selectedList.length)]];

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
editDatabaseButton.addEventListener("click", async () => {
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
    const selectedList = await loadList(category);
    selectedList.push(newItem);

    const newDatabaseContent = `const ${category} = ${JSON.stringify(selectedList, null, 2)};`;
    await updateDatabaseFile(newDatabaseContent, `${category}.js`);

    document.getElementById("new-item").value = ""; // Svuota il campo di input
    alert(`Elemento aggiunto con successo alla lista ${category}.`);
  } else {
    alert("Inserisci un elemento valido.");
  }
});

// Scrittura del file aggiornato
async function updateDatabaseFile(newContent, fileName) {
  const repoOwner = 'frnslt';
  const repoName = 'ImproRandom';
  const branch = 'main';
  const token = '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';

  const url = `https://raw.githubusercontent.com/frnslt/ImproRandom/main/${category}.js`;

  try {
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

    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Aggiornamento di ${fileName}`,
        content: btoa(newContent),
        sha: sha,
        branch: branch,
      }),
    });

    if (!putResponse.ok) {
      throw new Error(`Errore nella scrittura del file: ${putResponse.statusText}`);
    }

    alert(`File ${fileName} aggiornato con successo.`);
  } catch (error) {
    console.error(`Errore nell'aggiornamento del file ${fileName}:`, error);
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
