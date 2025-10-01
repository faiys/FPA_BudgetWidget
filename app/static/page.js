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
// let prevMonth = subMonth(1);
// console.log(prevMonth.getMonth() + 1); // number (1-12)
// console.log(prevMonth.toLocaleString('default', { month: 'long' })); // full nam



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
});

// Add Budget
async function AddBudget(ReportName, recordCursor, AllFetchArr){

  const enter_name = document.getElementById('budgetName').value.trim();
  const enter_year = document.getElementById('budgetYear').value;
  const enter_month = document.getElementById('startMonth').value;
  const enter_period = document.getElementById('period').value;

  var last3Month_List = []
  var last3Month = null;

  // If create the budget same year on jan or feb, take the actual last 3 month as Oct, nov, dec
  if(currentMonth_No == 1)
  {
    currentMonth_No = subMonth(1).getMonth() + 1;
  }
  else if(currentMonth_No == 2)
  {
    currentMonth_No = subMonth(2).getMonth() + 1;
  }

  // get Last3 Month
  if(currentMonth_No > 2)
  {
    last3Month = currentMonth_No - 2;
  }
  else if(currentMonth_No == 2)
  {
    last3Month = currentMonth_No - 1;
  }
  else
  {
    last3Month = currentMonth_No;
  }
   
  months.forEach((Month_Name, monthIdx) => {
    // 		Last 3 month month name
		if(monthIdx + 1 >= last3Month && monthIdx < currentMonth_No)
		{
			last3Month_List.push(Month_Name);
		}
  });
  // console.log(last3Month_List)

  // let pnlLast3MonthArr = await fetch(ReportName, recordCursor, last3Month_List)
  let pnlNowyearArr = await fetch(ReportName, recordCursor, [])
  let cosArrData = await fetch("COA_Report", recordCursor, []);

  // Use Map to get unique Class objects
  const distinctClassesMap = new Map();
  cosArrData.forEach(acc => {
    const key = acc.Class.ID + "_" + acc.Class.Class; 
    if (!distinctClassesMap.has(key)) {
      distinctClassesMap.set(key, acc.Class);
    }
  });
  const distinctClasses = Array.from(distinctClassesMap.values());
  console.log(distinctClasses);

  // get pnl uniq Account name and check coa arr for getting active account name
  const pnlAccountSet = new Set(pnlNowyearArr.map(item => item.Account_Name));
  const matchedCOA = cosArrData.filter(coa => pnlAccountSet.has(coa.Account_Name));
  console.log(matchedCOA);

  // Add unique Transaction_Details to each matched COA
  const coaWithTransactions = matchedCOA.map(coa => {
    const relatedPNL = pnlNowyearArr.filter(pnl => pnl.Account_Name === coa.Account_Name);
    const transactionDetails = [...new Set(relatedPNL.map(item => item.Transaction_Details))];
    return {
      ...coa,
      Transaction_Details: transactionDetails
    };
  });
  console.log(coaWithTransactions);

}