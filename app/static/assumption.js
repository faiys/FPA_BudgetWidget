// New Modal Assumption Popups
document.getElementById("openAssum").addEventListener("click", (e) => {
  e.preventDefault();
  assumPop.style.display = "flex";
  if(budPop.style.display === "flex")
  {
     budPop.style.display = "none";
  }
  if(prefillbud_pop.style.display === "flex")
  {
     prefillbud_pop.style.display = "none";
  }
  if(AssumPercnPop.style.display === "flex")
  {
     AssumPercnPop.style.display = "none";
  }
});

document.getElementById("closeAssum").addEventListener("click", () => {
  document.getElementById('AssumName').value = "";
  document.getElementById('assum-lookupInput').value = "";
  assumerrorDiv.style.display = 'none';
  assumPop.style.display = "none";  
});


// const assum_yearSelect = document.getElementById('budgetYear');
const assumlookupInput = document.getElementById("assum-lookupInput");
const assumlookupList = document.getElementById("assum-lookupList");
const assumaddBtn = document.querySelector('.Assummodal-actions .primary');
const assumerrorDiv = document.getElementById('AssumError');

// Populate Assum list dynamically
function renderAssumLookupList(filter = "") {
  let budgetItemsAllDataJson = JSON.parse(localStorage.getItem('budgetItemsData'));
  assumlookupList.innerHTML = "";

  // For user input search
  const assumfiltered = budgetItemsAllDataJson.filter(item =>
    item.Budget_Manager.Name.toLowerCase().includes(filter.toLowerCase())
  );
  // Getting unique data
  let AssumLookupFiltered = Array.from(
    new Map(assumfiltered.map(item => [item.Budget_Manager.ID, item])).values()
  );
  AssumLookupFiltered.forEach(item => {
    const div = document.createElement("div");
    div.className = "lookup-item";
    div.textContent = item.Budget_Manager.Name;
    div.dataset.id = item.Budget_Manager.ID;
    div.addEventListener("click", () => {
      assumlookupInput.value = item.Budget_Manager.Name;
      assumlookupInput.dataset.selectedId = item.Budget_Manager.ID;
      assumlookupList.style.display = "none";
    });
    assumlookupList.appendChild(div);
  });
  assumlookupList.style.display = AssumLookupFiltered.length ? "block" : "none";
}
// Show Assum list on focus
assumlookupInput.addEventListener("focus", () => {
  renderAssumLookupList();
});

// Assum Filter as user types
assumlookupInput.addEventListener("input", e => {
  renderAssumLookupList(e.target.value);
});

// Hide on outside click Assum lookup
document.addEventListener("click", e => {
  if (!assumlookupInput.contains(e.target) && !assumlookupList.contains(e.target)) {
    assumlookupList.style.display = "none";
  }
});

// Assum Form Validation
assumaddBtn.addEventListener('click', () => {
  const Assumname = document.getElementById('AssumName').value.trim();
  
  if (!assumlookupInput.value || !Assumname) {
    assumerrorDiv.textContent = '⚠ Please fill in all fields!';
    assumerrorDiv.style.display = 'block';
    return;
  }

  let budgetItemsAllDataJsonValidations = JSON.parse(localStorage.getItem('budgetItemsData'));
  if(budgetItemsAllDataJsonValidations.length <= 0 ){
    assumerrorDiv.textContent = '⚠ Oops! No budget data available';
    assumerrorDiv.style.display = 'block';
    return;
  }

  assumerrorDiv.style.display = 'none';
  assumPop.style.display = "none";
  // Call add budget fucn
  AssumGetBudget(assumlookupInput.dataset.selectedId, Assumname)
});

async function AssumGetBudget(budgetID, Assumname){
     const UserLists = await getUserDetail("All_Users_Js", "", [])
     if(UserLists != null){
        let OrgId = UserLists[0];
        let Assum_BudgetResp = await showLoaderWhile(fetch("Budget_Manager_Items_Js", "Assumption_budget", [budgetID], OrgId))
        if(Assum_BudgetResp){
            Assum_BudgetResp.forEach(item => {
            // If Budget_Manager exists, update its Name
            if (item.Budget_Manager) {
                item.Budget_Manager.Name = Assumname;
                item.Budget_Manager.zc_display_value = Assumname;
            }
            item["Budget_Manager.Name"] = Assumname;
            });
            showLoaderWhile(RenderBudgetTable("", "",Assum_BudgetResp, defaults="Assumption_budget", OrgId))
        }
     }
}



// Increase percentage
const typeToggle = document.getElementById("TypeToggle");
const typeLabel = document.getElementById("TypeLabel");
const assumPercent = document.getElementById("AssumPercent");
const assumerrorPercent = document.getElementById('AssumPercentError');
const assumPercentAddbtn = document.querySelector('.AssumPercentmodal-actions .primary');


// Stop add row collapse and open popup for add percentage.
document.addEventListener('DOMContentLoaded', () => {
  ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, function (e) {
      const btn = e.target.closest('.ass-percnt-moda-link');
      if (btn) {
        // stop ancestor handlers (capture & bubble)
        e.stopPropagation();

        // Only run on click, not on pointerdown/mousedown/touchstart
        if (evt === 'click') {
            // New Modal Assumption percentage Popups
            const isPercentLink = e.target.closest("[data-action='assumption-percentage-row']");
            let accname = isPercentLink.dataset.accountname;
            const closeBtn = e.target.closest("#closeAssumPercent");
    
            // Close modal if close button clicked or clicked outside modal
            if (closeBtn || (!isPercentLink && !AssumPercnPop.contains(e.target))) {
                AssumPercnPop.style.display = "none";
                return;
            }

            // If clicked on percentage link
            if (isPercentLink) {
                e.preventDefault();

                // Close if the same link is clicked again
                // if (AssumPercnPop.dataset.activeRow === isPercentLink.closest("tr")?.dataset.rowId) {
                //     console.log("closeBtn - ",closeBtn)
                //     AssumPercnPop.style.display = "none";
                //     AssumPercnPop.dataset.activeRow = "";
                //     return;
                // }

                // Close any open popup first
                AssumPercnPop.style.display = "none";

                // Find the row
                const row = isPercentLink.closest("tr");
                // const rect = row.getBoundingClientRect();

                // Adjust position dynamically
                // const modalHeight = AssumPercnPop.offsetHeight || 200;
                // const spaceBelow = window.innerHeight - rect.bottom;

                // Decide whether to show below or above row
                // let topPosition = rect.bottom + window.scrollY + 8;
                // if (spaceBelow < modalHeight) {
                // topPosition = rect.top + window.scrollY - modalHeight - 200;
                // }
                // Position the modal
                // AssumPercnPop.style.position = "absolute";
                // AssumPercnPop.style.top = `${topPosition}px`;
                // AssumPercnPop.style.left = `${rect.left + 100}px`; // tweak left alignment as needed
                AssumPercnPop.style.display = "flex";
                document.getElementById("percnt-win-name").innerHTML = accname;

                // Track active row
                AssumPercnPop.dataset.activeRow = row.dataset.rowId;
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
                resetForm();
            }
        }
      }
    }, true);
  });
});

// Update Amount / Percentage input field
function updateField() {
  if(typeToggle.checked) {
    typeLabel.textContent = "Percentage";
    assumPercent.placeholder = "Enter %";
    assumPercent.min = 0;
    assumPercent.max = 100;
  } else {
    typeLabel.textContent = "Amount";
    assumPercent.placeholder = "Enter Amount";
    assumPercent.removeAttribute("max");
  }
  assumPercent.value = null;
}
// Reset form to default values
function resetForm() {
  typeToggle.checked = false;  

  // Reset input field
  assumPercent.value = "";
  updateField();
}
// Event listeners
typeToggle.addEventListener("change", updateField);

// Close percentage popup
document.getElementById("closeAssumPercent").addEventListener("click", () => {
  resetForm();
  AssumPercnPop.style.display = "none";  
});

// Add percentage popup
assumPercentAddbtn.addEventListener('click', () => {
  let amt_percnt_labl = typeLabel.textContent;
  let Amt_perct_input = assumPercent.value.trim();

  if (!Amt_perct_input) {
    assumerrorPercent.textContent = '⚠ Please fill in all fields!';
    assumerrorPercent.style.display = 'block';
    return;
  }
  assumerrorDiv.style.display = 'none';
  //  getting table values callled final arr
  const finalFetchArr =  window.finalArrs;

  // Find the currently active row from the modal's dataset
  const activeRowId = AssumPercnPop.dataset.activeRow;
  const Active_accountRow = document.querySelector(`tr.account-row[data-row-id='${activeRowId}']`);
  if (!Active_accountRow) {
    console.warn("No active row found!");
    return;
  }
  
  let active_accountRow_filtered = finalFetchArr.filter(item => 
    item.Budget_Manager === Active_accountRow.dataset.budgetId 
    && item.Class === Active_accountRow.dataset.categoryId
    && item.Account_Name === Active_accountRow.dataset.account);
  
    active_accountRow_filtered.forEach(active_acc_Row => {
      months.forEach(month => {
        let currentValue = parseFloat(active_acc_Row[month]) || 0;
        let inputValue = parseFloat(Amt_perct_input) || 0;

        if (amt_percnt_labl === "Amount") {
          // Add fixed amount
          active_acc_Row[month] = currentValue + inputValue;
        } else {
          // Increase by percentage
          active_acc_Row[month] = currentValue * (1 + inputValue / 100);
        }
      });
  });


  // // Transform the array
  const transformedArr = finalFetchArr.map(item => {
      return {
          ...item,
          Account_Name: {
              Account_Name: item.account_name,
              ID: item.Account_Name
          },
          Budget_Manager: {
              ID: item.Budget_Manager,
              Name: item.budget_name
          },
          Class: {
              Class: item.class_name,
              ID: item.Class
          },
          Organisation: {
              ID: item.Organisation,
              Name: ""
          },  
      };
  });

  AssumPercnPop.style.display = "none";
  showLoaderWhile(RenderBudgetTable("", "",transformedArr, defaults="Assumption_budget"),"")
});