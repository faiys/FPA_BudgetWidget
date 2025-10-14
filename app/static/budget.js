const yearSelect = document.getElementById('budgetYear');
const today = new Date();
const currentYear = today.getFullYear();
const startYear = currentYear > 2024 ? 2024 : currentYear;
const addBtn = document.querySelector('.budgetmodal-actions .primary');
const errorDiv = document.getElementById('budgetError');

const budPop = document.getElementById("BudgetModal");
const prefillbud_pop =document.getElementById("PreBudModal");
const assumPop = document.getElementById("AssumModal");
const AssumPercnPop = document.getElementById("AssumPercentModal");

function NowMonth(){
  let d = new Date();
  return d.getMonth() + 1;
}
var currentMonth_No = NowMonth();

function subMonth(n) {
  let d = new Date();
  d.setMonth(d.getMonth() - n); 
  return d;
}

// New Modal budget Popups
document.getElementById("openBudget").addEventListener("click", (e) => {
  e.preventDefault();
  budPop.style.display = "flex";
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

document.getElementById("closeBudget").addEventListener("click", () => {
  document.getElementById('budgetName').value = "";
  document.getElementById('budgetYear').value = "";
  budPop.style.display = "none";
  
});

// Add Budget popup Function to populate years dynamically
function populateYears(startYear, numYears) {
  yearSelect.innerHTML = ''; // Clear existing options
  const defaultOption = document.createElement('option');
  defaultOption.textContent = 'Select year';
  defaultOption.value = '';
  yearSelect.appendChild(defaultOption);

  for (let i = 0; i < numYears; i++) {
    const option = document.createElement('option');
    option.textContent = startYear + i;
    option.value = startYear + i;
    yearSelect.appendChild(option);
  }
}
// Budget Form Validation
addBtn.addEventListener('click', () => {
  const name = document.getElementById('budgetName').value.trim();
  const year = document.getElementById('budgetYear').value;
  const month = document.getElementById('startMonth').value;
  const period = document.getElementById('period').value;

  if (!name || !year || !month || !period) {
    errorDiv.textContent = '⚠ Please fill in all fields!';
    errorDiv.style.display = 'block';
    return;
  }
  errorDiv.style.display = 'none';
  budPop.style.display = "none";
  // Call add budget fucn
  showLoaderWhile(AddBudget('PnL_Raw_Report_JS', '', AllFetchArr=[]))
});

// Add Budget
async function AddBudget(ReportName, recordCursor, AllFetchArr){

  const enter_name = document.getElementById('budgetName').value.trim();
  const enter_year = document.getElementById('budgetYear').value;
  const enter_month = document.getElementById('startMonth').value;
  const enter_period = document.getElementById('period').value;

  let pnlNowyearArr = await fetch(ReportName, recordCursor, [])
  let cosArrData = await fetch("COA_Report_JS", recordCursor, []);

  // Compute last 3 months including current
  let last3Months = [];
  for (let i = 2; i >= 0; i--) { // 2 months before, 1 month before, current
    let d = new Date(currentYear, currentMonth_No - 1 - i, 1);
    last3Months.push({
      monthNo: d.getMonth() + 1,
      year: d.getFullYear()
    });
  }
  // Filter pnlArr for last 3 months
  const last3MonthData = pnlNowyearArr.filter(item => {
    const itemMonth = parseInt(item.Month_No);
    const itemYear = parseInt(item.Year_field);
    return last3Months.some(m => m.monthNo === itemMonth && m.year === itemYear);
  });
  // getting middle month for populate the amount to the table.
  last3MonthData.sort((a, b) => Number(a.Month_No) - Number(b.Month_No));
  let centerIndex = Math.floor((last3MonthData.length - 1) / 2);
  let centerMonthNo = last3MonthData[centerIndex].Month_No;
  let centerMonthArr = last3MonthData.filter(item => item.Month_No === centerMonthNo);  
  //Sum Amounts grouped by Account_Name and Transaction_Details
  let sumByCriteria = {};
  centerMonthArr.forEach(item => {
    const key = `${item.Account_Name}||${item.Transaction_Details}`; // combine criteria
    const amount = parseFloat(item.Amount) || 0;
    
    if (!sumByCriteria[key]) sumByCriteria[key] = 0;
    sumByCriteria[key] += amount;
  });
  // Convert to an array if needed
  let summedArr = Object.entries(sumByCriteria).map(([key, total]) => {
    const [Account_Name, Transaction_Details] = key.split("||");
    return {
      Account_Name,
      Transaction_Details,
      Total_Amount: total
    };
  });

  // Mergr pnl and COA 
  let merged = [];
  cosArrData.forEach(coa => {
    if (!coa || !coa.Account_Name || !coa.Class) return;

    // Last 3 month checking
    let Last3Match = last3MonthData.filter(pnl =>
      coa.Account_Name === pnl.Account_Name 
    );

    // Default checking
    let matches = pnlNowyearArr.filter(pnl =>
      coa.Account_Name === pnl.Account_Name 
    );
    if (matches.length > 0 ) {
      // Track distinct transaction details to avoid duplicates
      let seenDetails = new Set();

      matches.forEach(pnl => {
        if (!seenDetails.has(pnl.Transaction_Details)) {
          seenDetails.add(pnl.Transaction_Details);

          let obj ={
            Account_Name: {
              Account_Name: coa.Account_Name,
              ID: coa.ID
            },
            Class: {
              Class: coa.Class.Class || coa.Class[" "],
              ID: coa.Class.ID
            },
            Budget_Manager: {
              ID: "4837701000000211575",
              Name: enter_name
            },
            Customer: pnl.Transaction_Details,
            Year_field: enter_year
          };
          // Find the 2nd month object from Last3Match that matches both Account_Name and Transaction_Details
          const secondMonthObj = summedArr.find((m) => 
            m.Transaction_Details === pnl.Transaction_Details && m.Account_Name == pnl.Account_Name
          );
          const amountToAssign = secondMonthObj ? parseFloat(secondMonthObj.Total_Amount) : 0;

          // User Filter
          const startIndex = months.indexOf(enter_month);
          if (enter_period.toLowerCase() === "monthly") {
              months.forEach((month, i) => {
                if (i < startIndex) {
                  obj[month] = "0.00"; // before start → zero
                } else {
                  obj[month] = amountToAssign.toFixed(2); // start and after → amount
                }
              });
          }
          else{
              const period = parseInt(enter_period, 10); // convert string to number
              const endIndex = startIndex + period - 1; // inclusive

              if (endIndex >= months.length) {
                alert(`Selected period of ${period} months exceeds the year!`);
                endIndex = months.length - 1;
              }
              else{
                months.forEach((month, i) => {
                  if (i < startIndex || i > endIndex) {
                    obj[month] = "0.00"; // before start or after period
                  } else {
                    obj[month] = amountToAssign.toFixed(2); // within period
                  }
                });
              }
          }

          // Initialize all months with 0.00
          Actual_months.forEach(month => {
            obj[month] = "0.00";
          });
          // Filter all matching records
          const matchingArr = Last3Match.filter(lm =>
            lm.Transaction_Details === pnl.Transaction_Details &&
            lm.Account_Name === pnl.Account_Name
          );
          const monthSums = {};
          matchingArr.forEach(item => {
            if (item.Month_field) {
              const monthKey = "Actual_" + item.Month_field;
              if (!monthSums[monthKey]) monthSums[monthKey] = 0;
              monthSums[monthKey] += parseFloat(item.Amount || 0);
            }
          });
          // Assign summed amounts to obj
          Object.keys(monthSums).forEach(monthKey => {
            if (Actual_months.includes(monthKey)) {
              obj[monthKey] = monthSums[monthKey].toFixed(2);
            }
          });

          merged.push(obj);
        }
      });
    }
  });
  // console.log("mergerd - ", merged)
  RenderBudgetTable("", "",merged, defaults="addBudget")
}
function createBudgetButtons(mergedArr, BudgetFormArr, type){
  const budgetSaveCancel = document.getElementById("budgetsave-cancel");

  budgetSaveCancel.innerHTML = "";
  // Create Save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "budgetbtn-save";
  saveBtn.textContent = "Save Changes";
  saveBtn.id = "budgetbtn-save";
  // Create Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "budgetbtn-cancel";
  cancelBtn.textContent = "Remove Budget";
  cancelBtn.id = "budgetbtn-cancel";

  // Append buttons to container
  budgetSaveCancel.appendChild(saveBtn);
  budgetSaveCancel.appendChild(cancelBtn);

    // Add click listeners **after buttons are created**
  saveBtn.addEventListener('click', async function() {

    if( type === "addBudget"){
      var postMap = {name:BudgetFormArr.name, year:BudgetFormArr.year, month:BudgetFormArr.month, period : BudgetFormArr.period};
    }
    else if(type === "prefillBudget"){
      var postMap = {name:BudgetFormArr.name, year:BudgetFormArr.year, month:BudgetFormArr.month, period : ""};
    }
    else if(type === "Assumption_budget"){
      var postMap = {name:BudgetFormArr.name, year:BudgetFormArr.year, month:BudgetFormArr.month, period : ""};
    }
    // LoadingScreen();
    const addbudgetResp = await POSTRecord("Budget_Manager", postMap);
    if(addbudgetResp.code == 3000)
    {
      const updatedArr = mergedArr.map(item => ({
        ...item,
        "Budget_Manager": addbudgetResp.data.ID,
        "Account_Name": item.Account_Name,
        "Class": item.Class,
        "UpdateRecordsJs": true
      }));
      const buklAPIResp = await showLoaderWhile(POSTBulkRecord("Budget_Manager_Items", updatedArr));
      if(buklAPIResp.code == 3000){
        let AllFetchArr=[];
        showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults="budgetItems"));
        budgetSaveCancel.innerHTML = "";
      }
      else{
        errorMsg("Error! Contact support team.","red");
      }
    }
    else{
      errorMsg(addbudgetResp.error.Name,"red")
    }
    document.getElementById('budgetName').value = "";
    document.getElementById('budgetYear').value = "";
    document.getElementById('PreBudName').value = "";
    document.getElementById('lookupInput').value = "";
    document.getElementById('AssumName').value = "";
    document.getElementById('assum-lookupInput').value = "";

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

  cancelBtn.addEventListener('click', function() {
    let AllFetchArr=[];
    showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults="budgetItems"));
    budgetSaveCancel.innerHTML = "";
    document.getElementById('budgetName').value = "";
    document.getElementById('budgetYear').value = "";
    document.getElementById('PreBudName').value = "";
    document.getElementById('lookupInput').value = "";
    document.getElementById('AssumName').value = "";
    document.getElementById('assum-lookupInput').value = "";

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

  // Clear Seach values
  searchBudgetLookupInput.value = null;
  searchYearLookupInput.value = null;
  searchClassLookupInput.value = null;
  searchAccountLookupInput.value = null;
  searchCustomerLookupInput.value = null;

  function enableButtons() {
    [saveBtn, cancelBtn].forEach(btn => {
      btn.classList.add("enabled");
    });
  }
  setTimeout(enableButtons, 3000);
}






// Prefill Previus budget popup
document.getElementById("openPreBud").addEventListener("click", (e) => {
  e.preventDefault();
  prefillbud_pop.style.display = "flex";
   if(budPop.style.display === "flex")
  {
     budPop.style.display = "none";
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

document.getElementById("closePreBud").addEventListener("click", () => {
  document.getElementById('PreBudName').value = "";
  document.getElementById('lookupInput').value = "";
  prefillbud_pop.style.display = "none";  
});

const lookupInput = document.getElementById("lookupInput");
const lookupList = document.getElementById("lookupList");
const PreBudaddBtn = document.querySelector('.PreBudmodal-actions .primary');
const PreBuderrorDiv = document.getElementById('PreBudError');

// Populate Budget list dynamically
function renderLookupList(filter = "") {
  let budgetItemsAllDataJson = JSON.parse(localStorage.getItem('budgetItemsData'));
  lookupList.innerHTML = "";
  // For user input search
  const filtered = budgetItemsAllDataJson.filter(item =>
    item.Budget_Manager.Name.toLowerCase().includes(filter.toLowerCase())
  );
  // Getting unique data
  let LookuoFiltered = Array.from(
    new Map(filtered.map(item => [item.Budget_Manager.ID, item])).values()
  );
  LookuoFiltered.forEach(item => {
    const div = document.createElement("div");
    div.className = "lookup-item";
    div.textContent = item.Budget_Manager.Name;
    div.dataset.id = item.Budget_Manager.ID;
    div.addEventListener("click", () => {
      lookupInput.value = item.Budget_Manager.Name;
      lookupInput.dataset.selectedId = item.Budget_Manager.ID;
      lookupList.style.display = "none";
    });
    lookupList.appendChild(div);
  });
  lookupList.style.display = LookuoFiltered.length ? "block" : "none";
}

// Show Budget list on focus
lookupInput.addEventListener("focus", () => {
  renderLookupList();
});

// Budget Filter as user types
lookupInput.addEventListener("input", e => {
  renderLookupList(e.target.value);
});

// Hide on outside click Budget lookup
document.addEventListener("click", e => {
  if (!lookupInput.contains(e.target) && !lookupList.contains(e.target)) {
    lookupList.style.display = "none";
  }
});

// Prefill Budget Form Validation
PreBudaddBtn.addEventListener('click', () => {
  const prefilname = document.getElementById('PreBudName').value.trim();
  const selectBudget = document.getElementById('lookupInput');

  if (!selectBudget.value || !prefilname) {
    PreBuderrorDiv.textContent = '⚠ Please fill in all fields!';
    PreBuderrorDiv.style.display = 'block';
    return;
  }
  PreBuderrorDiv.style.display = 'none';
  prefillbud_pop.style.display = "none";
  // Call add budget fucn
  PrefillGetBudget(selectBudget.dataset.selectedId, prefilname)
});

// get Prefil budget
async function PrefillGetBudget(budgetID, prefilname){
  let PrefillBudgetResp = await showLoaderWhile(fetch("Budget_Manager_Items_Js", "prefilbudget", [budgetID]))
  if(PrefillBudgetResp){
    PrefillBudgetResp.forEach(item => {
      // If Budget_Manager exists, update its Name
      if (item.Budget_Manager) {
          item.Budget_Manager.Name = prefilname;
          item.Budget_Manager.zc_display_value = prefilname;
      }
      item["Budget_Manager.Name"] = prefilname;
    });
    showLoaderWhile(RenderBudgetTable("", "",PrefillBudgetResp, defaults="prefillBudget"))
  }
}