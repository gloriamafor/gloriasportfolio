// ======================= CONFIGURATION =======================
const ITEMS_PER_PAGE = 6;
const RESULT_LIMIT = 30; // Fetch more results for pagination
const API_BASE = "https://kirzcczlye.execute-api.us-east-2.amazonaws.com";

// ======================= 🌍 COUNTRY DROPDOWN =======================
const countrySelect = document.getElementById("cuisine");
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso",
  "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia",
  "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Kosovo",
  "Northern Cyprus", "South Ossetia", "Abkhazia", "Transnistria", "Somaliland", "Nagorno-Karabakh"
];

countrySelect.innerHTML = '<option value="">Select...</option>';
countries.forEach(c => {
  const option = document.createElement("option");
  option.value = c;
  option.textContent = c;
  countrySelect.appendChild(option);
});

// ======================= 🥗 DIET DROPDOWN =======================
const dietSelect = document.getElementById("diet");
dietSelect.innerHTML = '<option value="">Select...</option>';
const diets = ["Vegetarian", "Vegan", "High Protein", "Gluten Free"];
diets.forEach(d => dietSelect.appendChild(new Option(d, d)));

// ======================= 🍽️ MEAL TYPE DROPDOWN =======================
const mealTypeSelect = document.getElementById("meal_type");
mealTypeSelect.innerHTML = '<option value="">Select...</option>';
const mealTypes = ["Breakfast", "Lunch", "Snack", "Dinner"];
mealTypes.forEach(m => mealTypeSelect.appendChild(new Option(m, m)));

// ======================= STATE MANAGEMENT =======================
const resultEl = document.getElementById("result");
const paginationEl = document.getElementById("pagination");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfoEl = document.getElementById("pageInfo");
const totalResultsEl = document.getElementById("totalResults");

let activeController = null;
let stopRequested = false;
let allRecipes = [];
let currentPage = 1;
let totalPages = 1;

// ======================= DISPLAY FUNCTIONS =======================
function setResultMessage(message, isLoading = false) {
  if (isLoading) {
    resultEl.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">${message}</p>
      </div>
    `;
  } else {
    resultEl.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
  }
  paginationEl.classList.add("hidden");
}

function updatePagination() {
  totalPages = Math.ceil(allRecipes.length / ITEMS_PER_PAGE);
  
  if (totalPages <= 1) {
    paginationEl.classList.add("hidden");
    return;
  }
  
  paginationEl.classList.remove("hidden");
  pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
  totalResultsEl.textContent = `${allRecipes.length} recipes found`;
  
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function displayCurrentPage() {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageRecipes = allRecipes.slice(startIndex, endIndex);
  
  resultEl.innerHTML = "";
  
  pageRecipes.forEach((recipe, index) => {
    const card = document.createElement("div");
    card.className = "recipe-card reveal";
    card.style.animationDelay = `${index * 0.08}s`;
    
    const cuisine = recipe.country || "Unknown";
    const imageMarkup = recipe.image
      ? `<img src="${recipe.image}" alt="${recipe.title} photo" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-fallback\\'>No image available</div>'">`
      : `<div class="image-fallback">No image available</div>`;
    
    card.innerHTML = `
      <div class="card-media">${imageMarkup}</div>
      <div class="card-header">
        <h3>${escapeHtml(recipe.title)}</h3>
        <span class="pill">${escapeHtml(cuisine)}</span>
      </div>
      <div class="card-section">
        <p class="card-label">Ingredients</p>
        <div class="card-text">${recipe.ingredients}</div>
      </div>
      <div class="card-section">
        <p class="card-label">Steps</p>
        <div class="card-text">${recipe.instructions}</div>
      </div>
      <a class="card-link" href="${recipe.sourceUrl}" target="_blank" rel="noopener">
        View Full Recipe
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </a>
    `;
    resultEl.appendChild(card);
  });
  
  updatePagination();
  
  // Scroll to results on page change (except first load)
  if (currentPage > 1 || document.querySelector('.recipe-card')) {
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ======================= 💾 SAVE USER SELECTIONS =======================
function saveSelections() {
  localStorage.setItem("cuisine", countrySelect.value);
  localStorage.setItem("diet", dietSelect.value);
  localStorage.setItem("mealType", mealTypeSelect.value);
}

function restoreSelection(selectEl, storedValue) {
  if (!storedValue) {
    selectEl.value = "";
    return;
  }
  const hasOption = Array.from(selectEl.options).some(option => option.value === storedValue);
  selectEl.value = hasOption ? storedValue : "";
}

window.addEventListener("load", () => {
  restoreSelection(countrySelect, localStorage.getItem("cuisine"));
  restoreSelection(dietSelect, localStorage.getItem("diet"));
  restoreSelection(mealTypeSelect, localStorage.getItem("mealType"));
});

// ======================= 🍳 GET RECOMMENDATION & SURPRISE ME =======================
/*async function fetchRecipe(query) {
  try {
    stopRequested = false;
    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();
    
    setResultMessage("Finding the tastiest options...", true);
    
    const params = new URLSearchParams(query);
    params.set("limit", RESULT_LIMIT);
    
   const response = await fetch(`${API_BASE}/recommend?${params.toString()}`, {
      method: "GET",
      signal: activeController.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });
  const data = await response.json();

  if (!response.ok) {
    setResultMessage(data.error || `Request failed with status ${response.status}`);
    return;
  }

  if (!data || data.error) {
    setResultMessage(data.error || "No results found.");
    return;
  }

  if (stopRequested) {
    return;
  }

    // Store all recipes and reset to first page
    allRecipes = data;
    currentPage = 1;
    
    if (allRecipes.length === 0) {
      setResultMessage("No recipes found. Try different filters.");
      return;
    }
    
    displayCurrentPage();
    
  } catch (err) {
    if (err && err.name === "AbortError") {
      return;
    }
    const message = err && err.message ? err.message : String(err);
    setResultMessage(`Something went wrong: ${message}`);
  }
}*/
async function fetchRecipe(query) {
  try {
    stopRequested = false;
    if (activeController) {
      activeController.abort();
    }
    activeController = new AbortController();

    setResultMessage("Finding the tastiest options...", true);

    const params = new URLSearchParams(query);
    params.set("limit", RESULT_LIMIT);

    const response = await fetch(`${API_BASE}/recommend?${params.toString()}`, {
      method: "GET",
      signal: activeController.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setResultMessage(data.error || `Request failed with status ${response.status}`);
      return;
    }

    if (!data || data.error) {
      setResultMessage(data.error || "No results found.");
      return;
    }

    if (stopRequested) {
      return;
    }

    allRecipes = data;
    currentPage = 1;

    if (allRecipes.length === 0) {
      setResultMessage("No recipes found. Try different filters.");
      return;
    }

    displayCurrentPage();

  } catch (err) {
    if (err && err.name === "AbortError") {
      return;
    }
    const message = err && err.message ? err.message : String(err);
    setResultMessage(`Something went wrong: ${message}`);
  }
}

// ======================= EVENT LISTENERS =======================
document.getElementById("getRecommendation").addEventListener("click", () => {
  saveSelections();
  const craving = document.getElementById("craving").value;
  const country = countrySelect.value.trim();
  const diet = dietSelect.value.trim();
  const mealType = mealTypeSelect.value.trim();
  
  const parts = [craving, country, diet, mealType, "recipes"].filter(Boolean);
  const query = parts.join(" ");
  
  fetchRecipe({
    query,
    country,
    craving,
    diet,
    meal_type: mealType,
  });
});

document.getElementById("surpriseMe").addEventListener("click", () => {
  saveSelections();
  const randomCountry = countries[Math.floor(Math.random() * countries.length)];
  const randomMeal = mealTypes[Math.floor(Math.random() * mealTypes.length)];
  const randomDiet = diets[Math.floor(Math.random() * diets.length)];
  const randomCravingOptions = ["sweet", "salty", "spicy", "sweet-spicy"];
  const randomCraving = randomCravingOptions[Math.floor(Math.random() * randomCravingOptions.length)];
  
  const parts = [randomCraving, randomCountry, randomDiet, randomMeal, "recipes"].filter(Boolean);
  const query = parts.join(" ");
  
  fetchRecipe({
    query,
    country: randomCountry,
    craving: randomCraving,
    diet: randomDiet,
    meal_type: randomMeal,
  });
});

document.getElementById("stopResults").addEventListener("click", () => {
  stopRequested = true;
  if (activeController) {
    activeController.abort();
  }
  setResultMessage("Stopped. Adjust your filters and try again.");
});

// Pagination event listeners
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayCurrentPage();
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    displayCurrentPage();
  }
});

// Keyboard navigation for pagination
document.addEventListener("keydown", (e) => {
  if (allRecipes.length === 0) return;
  
  if (e.key === "ArrowLeft" && currentPage > 1) {
    currentPage--;
    displayCurrentPage();
  } else if (e.key === "ArrowRight" && currentPage < totalPages) {
    currentPage++;
    displayCurrentPage();
  }
});
