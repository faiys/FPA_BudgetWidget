const openSearchBtn = document.getElementById('openSearch');
const closeSearchBtn = document.getElementById('closeSearch');
const searchContainer = document.getElementById('searchContainer');
const searchOverlay = document.getElementById('searchOverlay');

const applySearchBtn = document.getElementById('applySearch');
const clearSearchBtn = document.getElementById('clearSearch');
// USer input
const searchBudgetLookupInput = document.getElementById("searchBudget-lookupInput");
const searchBudgetlookupList = document.getElementById("searchBudget-lookupList");
const searchYearLookupInput = document.getElementById("searchYear-lookupInput");
const searchYearlookupList = document.getElementById("searchYear-lookupList");
const searchClassLookupInput = document.getElementById("searchClass-lookupInput");
const searchClasslookupList = document.getElementById("searchClass-lookupList");
const searchAccountLookupInput = document.getElementById("searchAccount-lookupInput");
const searchAccountlookupList = document.getElementById("searchAccount-lookupList");

const budgetItemsAllDataJsonConst = JSON.parse(localStorage.getItem('budgetItemsData'));
const searchErrID = document.getElementById("error-searchId");

// Populate searchBudget list dynamically
function renderSearchBudgetLookup(type, filter = "") {
  let data = budgetItemsAllDataJsonConst;
  let listElement, inputElement, fieldKey, uniqueValues;

  // Map field keys to their respective inputs & lists
  const lookupMap = {
    budget: {
      key: "Budget_Manager.Name",
      input: searchBudgetLookupInput,
      list: searchBudgetlookupList
    },
    year: {
      key: "Year_field",
      input: searchYearLookupInput,
      list: searchYearlookupList
    },
    class: {
      key: "Class.Class",
      input: searchClassLookupInput,
      list: searchClasslookupList
    },
    account: {
      key: "Account_Name.Account_Name",
      input: searchAccountLookupInput,
      list: searchAccountlookupList
    },
  };

  // Get config for this type
  const config = lookupMap[type];
  if (!config) return;

  listElement = config.list;
  inputElement = config.input;
  fieldKey = config.key;
  listElement.innerHTML = "";

  // Resolve nested keys like "Budget_Manager.Name"
  const getValue = (obj, keyPath) => keyPath.split(".").reduce((acc, key) => acc?.[key], obj);

  // Get unique field values
  uniqueValues = [...new Set(data.map(item => getValue(item, fieldKey)))];
  // Filter values
  const filtered = uniqueValues.filter(val =>
    val?.toString().toLowerCase().includes(filter.toLowerCase())
  );

  // Render results
  filtered.forEach(val => {
    const div = document.createElement("div");
    div.className = "lookup-item";
    div.textContent = val;
    div.addEventListener("click", () => {
      inputElement.value = val;
      listElement.style.display = "none";
    });
    listElement.appendChild(div);
  });

  listElement.style.display = filtered.length ? "block" : "none";
}
// Budget Name
searchBudgetLookupInput.addEventListener("focus", () => renderSearchBudgetLookup("budget"));
searchBudgetLookupInput.addEventListener("input", e => renderSearchBudgetLookup("budget", e.target.value));

// Year
searchYearLookupInput.addEventListener("focus", () => renderSearchBudgetLookup("year"));
searchYearLookupInput.addEventListener("input", e => renderSearchBudgetLookup("year", e.target.value));

// Class
searchClassLookupInput.addEventListener("focus", () => renderSearchBudgetLookup("class"));
searchClassLookupInput.addEventListener("input", e => renderSearchBudgetLookup("class", e.target.value));

// Account
searchAccountLookupInput.addEventListener("focus", () => renderSearchBudgetLookup("account"));
searchAccountLookupInput.addEventListener("input", e => renderSearchBudgetLookup("account", e.target.value));

// Account
// searchAccountLookupInput.addEventListener("focus", () => renderSearchBudgetLookup("account"));
// searchAccountLookupInput.addEventListener("input", e => renderSearchBudgetLookup("account", e.target.value));

// Hide on outside click
document.addEventListener("click", e => {
  Object.values(document.querySelectorAll(".lookup-list")).forEach(list => {
    if (!list.contains(e.target) && !list.previousElementSibling.contains(e.target)) {
      list.style.display = "none";
    }
  });
});



// function renderSearchBudgetLookup(filter = "") {
//   let budgetItemsAllDataJson = budgetItemsAllDataJsonConst;
//   searchBudgetlookupList.innerHTML = "";
//   // Getting unique data
//   let uniqueFiltered = Array.from(
//     new Map(budgetItemsAllDataJson.map(item => [item.Budget_Manager.ID, item])).values()
//   );
//     // For user input search
//   let serfiltered = uniqueFiltered.filter(item =>
//     item.Budget_Manager.Name.toLowerCase().includes(filter.toLowerCase())
//   );
//   serfiltered.forEach(item => {
//     // Budget Name
//     const SearchNamediv = document.createElement("div");
//     SearchNamediv.className = "lookup-item";
//     SearchNamediv.textContent = item.Budget_Manager.Name;
//     SearchNamediv.dataset.selectedId = item.Budget_Manager.ID;
//     SearchNamediv.addEventListener("click", () => {
//       searchBudgetLookupInput.value = item.Budget_Manager.Name;
//       searchBudgetLookupInput.dataset.selectedId = item.Budget_Manager.ID;
//       searchBudgetlookupList.style.display = "none";
//     });
//     searchBudgetlookupList.appendChild(SearchNamediv);

//     // Year
//     const Yeardiv = document.createElement("div");
//     Yeardiv.className = "lookup-item";
//     Yeardiv.textContent = item.Year_field;
//     Yeardiv.addEventListener("click", () => {
//       searchYearLookupInput.value = item.Year_field;
//       searchYearlookupList.style.display = "none";
//     });
//     searchYearlookupList.appendChild(Yeardiv);
//   });
//   searchYearlookupList.style.display = uniqueFiltered.length ? "block" : "none";
// }
// // Show search  list on focus
// searchBudgetLookupInput.addEventListener("focus", () => {
//   renderSearchBudgetLookup();
// });
// // search as user types
// searchBudgetLookupInput.addEventListener("input", e => {
//   renderSearchBudgetLookup(e.target.value);
// });
// // Hide on outside click search lookup
// document.addEventListener("click", e => {
//   if (!searchBudgetLookupInput.contains(e.target) && !searchBudgetlookupList.contains(e.target)) {
//     searchBudgetlookupList.style.display = "none";
//   }
// });




// Apply search filters
applySearchBtn.addEventListener('click', () => {
    // Collect selected search values
    const Allsearch = {
        budgetnameid: searchBudgetLookupInput.value.trim() || "",
        year: searchYearLookupInput.value.trim() || "",
        classname: searchClassLookupInput.value.trim() || "",
        accountname: searchAccountLookupInput.value.trim() || ""
    };

    const budgetItemsAllDataJson = budgetItemsAllDataJsonConst;

    // Validation: check if all filters are empty && !Allsearch.accountname
    if (!Allsearch.budgetnameid && !Allsearch.year && !Allsearch.classname && !Allsearch.accountname ) {
        searchErrID.textContent = '⚠ Please fill in at least one field!';
        searchErrID.style.display = 'block';
        return;
    }

    searchErrID.style.display = 'none'; // hide error if all good

    // --- Filtering logic ---
    const budgetsearcArr = budgetItemsAllDataJson.filter(item => {
        let match = true;

        if (Allsearch.budgetnameid)
            match = match && item.Budget_Manager.Name.toString() === Allsearch.budgetnameid.toString();

        if (Allsearch.year)
            match = match && item.Year_field.toString() === Allsearch.year.toString();

        if (Allsearch.classname)
            match = match && item.Class.Class.toString() === Allsearch.classname.toString();

        if (Allsearch.accountname)
            match = match && item.Account_Name.Account_Name.toLowerCase().includes(Allsearch.accountname.toLowerCase());

        return match;
    });

    // Render the filtered table
    RenderBudgetTable("Budget_Manager_Items_Js", "", budgetsearcArr, "search_Defaults");

    // Close Search container
    searchContainer.classList.remove('active');
    searchOverlay.classList.remove('active');
});


// applySearchBtn.addEventListener('click', () => {
//     let Allsearch = {
//         budgetnameid: searchBudgetLookupInput.dataset.selectedId
//     };
//     console.log("Allsearch - ",Allsearch)
//     // console.log(Allsearch)
//     let budgetItemsAllDataJson = budgetItemsAllDataJsonConst;

//     if (!Allsearch.budgetnameid) {
//         searchErrID.textContent = '⚠ Please fill in at least one field!';
//         searchErrID.style.display = 'block';
//         return;
//     }

//     let budgetsearcArr = budgetItemsAllDataJson.filter(item => item.Budget_Manager.ID === Allsearch.budgetnameid); 
//     RenderBudgetTable("Budget_Manager_Items_Js", "", budgetsearcArr, "search_Defaults")

//     // Close Search container
//     searchContainer.classList.remove('active');
//     searchOverlay.classList.remove('active');
// });

// Clear Search
clearSearchBtn.addEventListener('click', () => {
  
  searchBudgetLookupInput.value = null;
  RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr=[], defaults="budgetItems")
  
  // Close Search container
  searchContainer.classList.remove('active');
  searchOverlay.classList.remove('active');
  
});










// Open search panel
openSearchBtn.addEventListener('click', () => {
    searchErrID.style.display = "none";
    searchContainer.classList.add('active');
    searchOverlay.classList.add('active');
   if(budPop.style.display === "flex")
    {
      budPop.style.display = "none";
    }
    if(prefillbud_pop.style.display === "flex")
    {
      prefillbud_pop.style.display = "none";
    }
    if(assumPop.style.display === "flex")
    {
      assumPop.style.display = "none";
    }
    if(AssumPercnPop.style.display === "flex")
    {
      AssumPercnPop.style.display = "none";
    }
});

// Close search panel
closeSearchBtn.addEventListener('click', () => {
    searchErrID.style.display = "none";
    searchContainer.classList.remove('active');
    searchOverlay.classList.remove('active');
});

// Close search panel when clicking overlay
searchOverlay.addEventListener('click', () => {
   searchErrID.style.display = "none";
    searchContainer.classList.remove('active');
    searchOverlay.classList.remove('active');
});
