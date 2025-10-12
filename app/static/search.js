const openSearchBtn = document.getElementById('openSearch');
const closeSearchBtn = document.getElementById('closeSearch');
const searchContainer = document.getElementById('searchContainer');
const searchOverlay = document.getElementById('searchOverlay');

const applySearchBtn = document.getElementById('applySearch');
const clearSearchBtn = document.getElementById('clearSearch');

const searchBudgetLookupInput = document.getElementById("searchBudget-lookupInput");
const searchBudgetlookupList = document.getElementById("searchBudget-lookupList");


// Populate searchBudget list dynamically
function renderSearchBudgetLookup(filter = "") {
  searchBudgetlookupList.innerHTML = "";
  const filtered = window.budgetlookup.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  filtered.forEach(item => {
    const Searchdiv = document.createElement("div");
    Searchdiv.className = "lookup-item";
    Searchdiv.textContent = item.name;
    Searchdiv.dataset.id = item.id;
    Searchdiv.addEventListener("click", () => {
      searchBudgetLookupInput.value = item.name;
      searchBudgetLookupInput.dataset.selectedId = item.id;
      searchBudgetlookupList.style.display = "none";
    });
    searchBudgetlookupList.appendChild(Searchdiv);
  });
  searchBudgetlookupList.style.display = filtered.length ? "block" : "none";
}
// Show search  list on focus
searchBudgetLookupInput.addEventListener("focus", () => {
  renderSearchBudgetLookup();
});
// search as user types
searchBudgetLookupInput.addEventListener("input", e => {
  renderSearchBudgetLookup(e.target.value);
});
// Hide on outside click search lookup
document.addEventListener("click", e => {
  if (!searchBudgetLookupInput.contains(e.target) && !searchBudgetlookupList.contains(e.target)) {
    searchBudgetlookupList.style.display = "none";
  }
});


// Apply search filters
applySearchBtn.addEventListener('click', () => {
    const Allsearch = {
        budgetnameid: searchBudgetLookupInput.dataset.selectedId
    };
    console.log("window.finalArrs - ",window.finalArrs)
    // let budgetsearcArr = window.budgetlookup.filter(item => item.id === Allsearch.budgetnameid); 
    // console.log("budgetsearcArr - ", budgetsearcArr)
    
});












// Open search panel
openSearchBtn.addEventListener('click', () => {
    searchContainer.classList.add('active');
    searchOverlay.classList.add('active');
});

// Close search panel
closeSearchBtn.addEventListener('click', () => {
    searchContainer.classList.remove('active');
    searchOverlay.classList.remove('active');
});

// Close search panel when clicking overlay
searchOverlay.addEventListener('click', () => {
    searchContainer.classList.remove('active');
    searchOverlay.classList.remove('active');
});
