const yearSelect = document.getElementById('budgetYear');
const today = new Date();
const currentYear = today.getFullYear();
const startYear = currentYear > 2024 ? 2024 : currentYear;
const addBtn = document.querySelector('.budgetmodal-actions .primary');
const errorDiv = document.getElementById('budgetError');

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
  document.getElementById("BudgetModal").style.display = "flex";
});

document.getElementById("closeBudget").addEventListener("click", () => {
  document.getElementById("BudgetModal").style.display = "none";
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
  document.getElementById("BudgetModal").style.display = "none";
  // Call add budget fucn
  AddBudget('PnL_Raw_Report_JS', '', AllFetchArr=[])
});

// Add Budget
async function AddBudget(ReportName, recordCursor, AllFetchArr){

  const enter_name = document.getElementById('budgetName').value.trim();
  const enter_year = document.getElementById('budgetYear').value;
  const enter_month = document.getElementById('startMonth').value;
  const enter_period = document.getElementById('period').value;

  // const addbudgetResp = await POSTRecord("Budget_Manager", {name:enter_name, year:enter_year.toString(), month:enter_month.toString(), period : (enter_period.toLowerCase() === "monthly")? "": enter_period});
  // if(addbudgetResp.code == 3000)
  // {
    //addbudgetResp.data.ID

    let pnlNowyearArr = await fetch(ReportName, recordCursor, [])
    let cosArrData = await fetch("COA_Report_JS", recordCursor, []);

    console.log("pnl - ", pnlNowyearArr)
    console.log("cos - ", cosArrData)

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
    console.log("last3MonthData - ", last3MonthData);

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
    console.log("mergerd - ", merged)
    RenderBudgetTable("", "",merged, defaults=false)
    createBudgetButtons(merged, {name:enter_name, year:enter_year.toString(), month:enter_month.toString(), period : (enter_period.toLowerCase() === "monthly")? "": enter_period});

  // }
  // else{
  //   errorMsg("Budget creation failed.", "red")
  // }
}
function createBudgetButtons(mergedArr, BudgetFormArr){

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
    // const addbudgetResp = await POSTRecord("Budget_Manager", {name:BudgetFormArr.name, year:BudgetFormArr.year, month:BudgetFormArr.month, period : BudgetFormArr.period});
    // if(addbudgetResp.code == 3000)
    // {addbudgetResp.data.ID
      // const updatedArr = mergedArr.map(item => ({
      //   ...item,
      //   Budget_Manager: {
      //     ...item.Budget_Manager,
      //     ID: 123,
      //     Name: BudgetFormArr.name
      //   },
      // }));
      const updatedArr = mergedArr.map(item => ({
        ...item,
        "Budget_Manager": "4837701000000253003",
        "Account_Name": item.Account_Name.ID,
        "Class": item.Class.ID
      }));
      // remove old keys
      // updatedArr.forEach(obj => {
      //   delete obj.Budget_Manager;
      //   delete obj.Account_Name;
      //   delete obj.Class;
      // });
      console.log("updatedArr =", updatedArr);
      POSTBulkRecord("Budget_Manager_Items", updatedArr);
    // }
  });

  cancelBtn.addEventListener('click', function() {
    alert("Cancel button clicked!");
  });

  function enableButtons() {
    [saveBtn, cancelBtn].forEach(btn => {
      btn.classList.add("enabled");
    });
  }
  setTimeout(enableButtons, 3000);
}
