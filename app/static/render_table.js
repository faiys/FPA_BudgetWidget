const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const Actual_months = ['Actual_January','Actual_February','Actual_March','Actual_April','Actual_May','Actual_June','Actual_July','Actual_August','Actual_September','Actual_October','Actual_November','Actual_December'];
const accountColor = "style='background:#f5f0eb'";
const monthsMap = {Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11};

const budgetTableBody = document.getElementById("budgetTableBody");

// Cpnvert AddedTime String to DateTime
function parseAddedTime(s) {
  if (!s) return 0;
  s = s.trim();
  // capture: day-month-year hour:minute:second AM/PM
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) {
    // fallback: try Date.parse (may work in many browsers)
    const t = Date.parse(s.replace(/-/g, ' '));
    return isNaN(t) ? 0 : t;
  }
  const [, day, mon, year, hh, mm, ss, ampm] = m;
  let hour = parseInt(hh, 10);
  if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return new Date(Number(year), monthsMap[mon], Number(day), hour, Number(mm), Number(ss)).getTime();
}

// Render budget Table
async function RenderBudgetTable(ReportName, recordCursor, AllFetchArr, defaults){
    budgetTableBody.innerHTML = '';
    const budgetTable = document.querySelector(".budget-table");
    let arrData;
    if(defaults == "budgetItems" && ReportName){
        document.getElementById("search-link").style.display = "inline-block";
        arrData = await fetch(ReportName, recordCursor, AllFetchArr);
    }
    else if(defaults === "addBudget" || defaults === "prefillBudget" || defaults === "Assumption_budget" || defaults === "search_Defaults"){
        if(defaults != "search_Defaults"){
            document.getElementById("search-link").style.display = "none"; 
        }
        arrData = AllFetchArr;
    }
    arrData.sort((a, b) => parseAddedTime(b.Added_Time) - parseAddedTime(a.Added_Time));

    // Step 1: Sum month-wise by Budget_Manager.ID
    const BudgetNameArr = Object.values(
        arrData.reduce((acc, b) => {
            const budgetId = b.Budget_Manager.ID;
            if (!acc[budgetId]) {
            acc[budgetId] = { 
                id: budgetId,
                name: b.Budget_Manager.Name,
                year:b.Year_field,
                ...months.reduce((m, month) => { m[month] = 0; return m }, {}), // initialize months
                ...Actual_months.reduce((am, amonth) => { am[amonth] = 0; return am; }, {})
            };
            }
            months.forEach(month => {
                acc[budgetId][month] += parseFloat(b[month] || 0);
            });
            // Sum actual months (if present in b)
            Actual_months.forEach(amonth => {
                acc[budgetId][amonth] += parseFloat(b[amonth] || 0);
            });
            
            return acc;
        }, {})
    );

    document.getElementById("total-budgetID").innerHTML = BudgetNameArr.length;
    document.getElementById("record-countid").innerHTML = arrData.length;
    // getting this budget data pass to previous budget drobdown
    window.budgetlookup  = BudgetNameArr

    // ✅ Step 1: Find all month keys dynamically
    const category_months = Array.from(
    new Set(
        arrData.flatMap(obj =>
        Object.keys(obj).filter(k => !['Class','Budget_Manager'].includes(k))
        )
    )
    );
    // ✅ Step 2: Group by composite key (ClassID_BudgetID) and sum months
    const classArr = Object.values(
    arrData.reduce((acc, b) => {
        const key = b.Class.ID + "_" + b.Budget_Manager.ID;
        if (!acc[key]) {
        acc[key] = {
            classId: b.Class.ID,
            class: b.Class.Class,
            budgetId: b.Budget_Manager.ID,
            budgetName: b.Budget_Manager.Name,
            ...category_months.reduce((m, month) => ({ ...m, [month]: 0 }), {})
        };
        }
        category_months.forEach(month => {
        acc[key][month] += parseFloat(b[month] || 0);
        });
        return acc;
    }, {})
    );
    // ✅ Step 1: Find all month keys dynamically
    const account_months = Array.from(
    new Set(
        arrData.flatMap(obj =>
        Object.keys(obj).filter(k => !['Class','Budget_Manager','Account_Name'].includes(k))
        )
    )
    );
    classArr.sort((a, b) => b.class.localeCompare(a.class));

    // ✅ Step 2: Group by Account + Class + Budget
    const CoaArr = Object.values(
    arrData.reduce((acc, b) => {
        const key = b.Account_Name.ID + "_" + b.Class.ID + "_" + b.Budget_Manager.ID;
        if (!acc[key]) {
        acc[key] = {
            accountId: b.Account_Name.ID,
            accountName: b.Account_Name.Account_Name,
            classId: b.Class.ID,
            class: b.Class.Class,
            budgetId: b.Budget_Manager.ID,
            budgetName: b.Budget_Manager.Name,
            ...account_months.reduce((m, month) => ({ ...m, [month]: 0 }), {})
        };
        }
        account_months.forEach(month => {
        acc[key][month] += parseFloat(b[month] || 0);
        });
        return acc;
    }, {})
    );
    // ✅ Step 1: Find all month keys dynamically (exclude fixed keys)
    const customer_months = Array.from(
    new Set(
        arrData.flatMap(obj =>
        Object.keys(obj).filter(
            k => !['Class','Budget_Manager','Account_Name','Customer'].includes(k)
        )
        )
    )
    );
    CoaArr.sort((a, b) => a.accountName.localeCompare(b.accountName));

    // ✅ Step 2: Group by Account + Class + Budget + Customer
    const customerArr = Object.values(
    arrData.reduce((acc, b) => {
        const key = 
        (b.Account_Name?.ID || "NA") + "_" +
        b.Class.ID + "_" +
        b.Budget_Manager.ID + "_" +
        b.Customer;

        if (!acc[key]) {
        acc[key] = {
            accountId: b.Account_Name.ID,
            accountName: b.Account_Name?.Account_Name || null,
            classId: b.Class.ID,
            class: b.Class.Class,
            budgetId: b.Budget_Manager.ID,
            budgetName: b.Budget_Manager.Name,
            customer: b.Customer,
            item_id : b.ID,
            // initialize all months with 0
            ...customer_months.reduce((m, month) => ({ ...m, [month]: 0 }), {})
        };
        }
        
        // ✅ Sum month-wise
        customer_months.forEach(month => {
        acc[key][month] += parseFloat(b[month] || 0);
        });

        return acc;
    }, {})
    );
    customerArr.sort((a, b) => a.customer.localeCompare(b.customer));
    // Header 
    const actualMonthsInData = new Set();
    BudgetNameArr.forEach(budgetN => {
        Object.keys(budgetN).forEach(key => {
            if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
            actualMonthsInData.add(key);
            }
        });
    });
    const thead = document.querySelector('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th colspan="4">
        <div class="main-collapse">
           <i id="collapseIcon" class="bi bi-arrows-collapse" title="Collapse"></i>
           <i id="expandIcon" class="bi bi-arrows-expand" title="Expand" style="display:none;"></i>
        </div>
    </th>`;
    if(defaults === "addBudget" || defaults === "prefillBudget"){
        Array.from(actualMonthsInData).forEach(amonth => {
            const th = document.createElement('th');
            th.textContent = amonth.replace("Actual_", "Actual "); 
            headerRow.appendChild(th);
        });
    }
    months.forEach(month => {
        const th = document.createElement('th');
        th.textContent = month;
        headerRow.appendChild(th);
    });
    const actionTh = document.createElement('th');
    actionTh.textContent = "Action";
    headerRow.appendChild(actionTh);
    thead.innerHTML = '';
    thead.appendChild(headerRow);

    // Render budget name with distinct
    BudgetNameArr.forEach(budgetN => {
        
        // Budget name row
        const budgetRow = document.createElement('tr');
        budgetRow.classList.add('budget-row');
        budgetRow.innerHTML = `
            <td colspan="4">
                <div class="budget-name" data-budget-id="${budgetN.id}" data-target="budget-details">
                    <div class="budget-left">
                        <i class="fas fa-chevron-down"></i> ${budgetN.name}
                    </div>
                    <div class="budget-delete">
                    ${(defaults === "budgetItems") 
                        ? `<i class="bi bi-trash2 ms-auto" title="Remove" onclick="event.stopPropagation(); DeleteRecordByID('All_Budget_Managers', '${budgetN.id}')"></i>` 
                        : ""
                    }
                    </div>
                </div>
                
            </td>
        `;
        if(defaults === "addBudget" || defaults === "prefillBudget"){
            Object.keys(budgetN).forEach(key => {
                if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                    budgetRow.innerHTML += `<td class="tdfont">${formatIndia(budgetN[key])}</td>`;
                }
            });
        }
        months.forEach(month => {
             budgetRow.innerHTML += `<td class="tdfont">${budgetN[month] != "0.00" ? formatIndia(budgetN[month]) : ""}</td>`;
        });
        budgetRow.innerHTML += `<td class="tdfont"></td>`;
        budgetTableBody.appendChild(budgetRow);

        // Add click event to toggle budget details
        const budgetNameDiv = budgetRow.querySelector('.budget-name');
        budgetNameDiv.addEventListener('click', function() {
            toggleBudgetDetails(budgetN.id);
        });

        // Render class name
        // Filter based on the budget ID in this class arr
        let Class_filtered = classArr.filter(item => item.budgetId === budgetN.id);
        Class_filtered.forEach(cls_element => {
            const categoryRow = document.createElement('tr');
            categoryRow.classList.add('category-row');
            categoryRow.setAttribute('data-budget-id', cls_element.budgetId);
            categoryRow.setAttribute('data-year', budgetN.year);
            categoryRow.setAttribute('data-category', cls_element.class);

            const categoryIcon = cls_element.class === 'REVENUE' ? 
                '<i class="fas fa-arrow-up" style="color: var(--success-green);"></i>' : 
                '<i class="fas fa-arrow-down" style="color: var(--danger-red);"></i>';
            let cat_color = cls_element.class === 'REVENUE'? "style='color: var(--success-green);background-color: #e4e4e4;'" : "style='color: var(--danger-red);background-color: #e4e4e4;'";

            categoryRow.innerHTML = `
                <td style="background-color: #e4e4e4;"></td>
                <td colspan="3" class="${cls_element.class}-category" style="background-color: #e4e4e4;">
                    ${categoryIcon} ${cls_element.class}
                </td>       
            `;
            if(defaults === "addBudget" || defaults === "prefillBudget"){
                Object.keys(cls_element).forEach(key => {
                    if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                        categoryRow.innerHTML += `<td class="amount-cell" ${cat_color}>${formatIndia(cls_element[key])}</td>`;
                    }
                });
             }
            months.forEach(month => {
                categoryRow.innerHTML += `<td class="amount-cell" ${cat_color}>${(cls_element[month] != "0.00") ? formatIndia(cls_element[month]) : ""}</td>`;
            });
            categoryRow.innerHTML += `<td class="tdfont"></td>`;
            budgetTableBody.appendChild(categoryRow);

            // Add click event to toggle category details
            const categoryCell = categoryRow.querySelector(`.${cls_element.class}-category`);
            categoryCell.addEventListener('click', function() {
                toggleCategoryDetails(cls_element.budgetId, cls_element.class);
            });

            // Render Account name
            // Filter based on the budget ID and class in this account arr
            let Account_filtered = CoaArr.filter(item => item.budgetId === cls_element.budgetId && item.classId === cls_element.classId);
            Account_filtered.forEach(Account_element => {
                const accountRow = document.createElement('tr');
                accountRow.classList.add('account-row');
                accountRow.setAttribute('data-budget-id', Account_element.budgetId);
                accountRow.setAttribute('data-year', budgetN.year);
                accountRow.setAttribute('data-category', cls_element.class);
                accountRow.setAttribute('data-category-id', cls_element.classId);
                accountRow.setAttribute('data-account', Account_element.accountId);
                // For Add Assumption increase or decrease percentage
                accountRow.setAttribute('data-row-id', Account_element.accountId);
                accountRow.setAttribute('data-budgetname', budgetN.name);
                accountRow.setAttribute('data-accountname', Account_element.accountName);
                // || defaults === "budgetItems"
                accountRow.innerHTML = `
                    <td ${accountColor}></td>
                    <td colspan="3" class="account-td ${"id-"+Account_element.accountId}-category" ${accountColor}>
                        ${(defaults === "Assumption_budget") 
                            ? `<a id="openAssumPercent" class="ass-percnt-moda-link ms-auto" href="#" 
                                data-action="assumption-percentage-row"
                                data-accountname ="${Account_element.accountName}"
                                title="Inc/Dec Assumption" 
                                onclick="event.stopPropagation();"> 
                                <i class="bi bi-percent"></i>
                            </a>`: ``
                        }
                        <span style="margin-left: 5px;">${Account_element.accountName}<span>
                        <a class="fill-budget-value ms-auto" href="#" data-action="add-row">
                            <small>Add row</small> 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon align-middle">
                                <path fill="#208EFF" d="M5 256c0 138.6 112.4 251 251 251s251-112.4 251-251S394.6 5 256 5 5 117.4 5 256zm249.2-130.7l113 113c4.9 4.9 7.3 11.3 7.3 17.7 0 6.4-2.4 12.8-7.3 17.7l-113 113c-9.8 9.8-25.6 9.8-35.4 0-9.8-9.8-9.8-25.6 0-35.4l95.4-95.4-95.4-95.4c-9.8-9.8-9.8-25.6 0-35.4 9.8-9.6 25.6-9.6 35.4.2z">
                                </path>
                            </svg>
                        </a>
                    </td>                        
                `;
                if(defaults === "addBudget" || defaults === "prefillBudget"){
                    Object.keys(Account_element).forEach(key => {
                        if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                            accountRow.innerHTML += `<td class="amount-cell actual-colunm">${formatIndia(Account_element[key])}</td>`;
                        }
                    });
                }
                months.forEach(month => {
                    accountRow.innerHTML += `<td class="amount-cell">${(Account_element[month] != "0.00") ? formatIndia(Account_element[month]) : ""}</td>`;
                });
                accountRow.innerHTML += `<td class="tdfont"></td>`;
                budgetTableBody.appendChild(accountRow);
                
                // Add click event to toggle account details
                const accCell = accountRow.querySelector(`.${"id-"+Account_element.accountId}-category`);
                accCell.addEventListener('click', function() {
                    toggleAccountDetails(cls_element.budgetId, Account_element.accountId);
                });

                // Render Customer Arr
                let customer_filtered = customerArr.filter(item => 
                    item.budgetId === cls_element.budgetId && 
                    item.classId === cls_element.classId &&
                    item.accountId === Account_element.accountId 
                );
                customer_filtered.forEach(customer_element => {
                    const customerRow = document.createElement('tr');
                    customerRow.classList.add('customer-row');
                    customerRow.setAttribute('data-budget-id', customer_element.budgetId);
                    customerRow.setAttribute('data-budgetname', budgetN.name);
                    customerRow.setAttribute('data-year', budgetN.year);
                    customerRow.setAttribute('data-category', cls_element.class);
                    customerRow.setAttribute('data-category-id', cls_element.classId);
                    customerRow.setAttribute('data-account', Account_element.accountId);
                    customerRow.setAttribute('data-accountname', Account_element.accountName);
                    customerRow.setAttribute('data-customername', customer_element.customer);
                    customerRow.setAttribute('data-itemid', customer_element.item_id);
                    
                    let customerrowHTML= `
                    <td></td>
                    <td colspan="3" class="customer-td">
                        <a class="autofill-value ms-auto" href="#" 
                        data-action="autofill-row" 
                        data-itemid ="${customer_element.item_id}">
                            <small>Autofill</small> 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon align-middle">
                                <path fill="#208EFF" d="M5 256c0 138.6 112.4 251 251 251s251-112.4 251-251S394.6 5 256 5 5 117.4 5 256zm249.2-130.7l113 113c4.9 4.9 7.3 11.3 7.3 17.7 0 6.4-2.4 12.8-7.3 17.7l-113 113c-9.8 9.8-25.6 9.8-35.4 0-9.8-9.8-9.8-25.6 0-35.4l95.4-95.4-95.4-95.4c-9.8-9.8-9.8-25.6 0-35.4 9.8-9.6 25.6-9.6 35.4.2z">
                                </path>
                            </svg>
                        </a>
                        <input type="text" class="amount-input-text" value="${customer_element.customer}" 
                            data-budget-id="${customer_element.budgetId}" 
                            data-category="${cls_element.class}" 
                            data-categoryId="${Account_element.classId}" 
                            data-account="${Account_element.accountId}" 
                        >
                    </td>`
                    if(defaults === "addBudget" || defaults === "prefillBudget" ){
                        Object.keys(customer_element).forEach(key => {
                            if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                                customerrowHTML += `<td class="amount-cell actual-cell actual-colunm" data-actual-month="${key}">${formatIndia(customer_element[key])}</td>`;
                            }
                        });
                    }
                    months.forEach((month, idx) => {
                    const val = customer_element[month] != "0.00" ? formatIndia(customer_element[month]) : "";
                    customerrowHTML += `
                        <td class="amount-cell">
                        <input type="text" class="amount-input"
                            value="${val}" 
                            data-budget-id="${customer_element.budgetId}" 
                            data-category="${cls_element.class}" 
                            data-account="${Account_element.accountId}"
                            data-month="${idx + 1}">
                        </td>
                    `;
                    });
                    if(defaults === "budgetItems"){
                        customerrowHTML += `<td class="amount-cell">
                            <div class="action-icons">
                                <div class="approve-reject">
                                    
                                </div>
                                <div class="remove">
                                    <i class="fa fa-trash" title="Remove Item" onclick="DeleteRecordByID('Budget_Manager_Items_Js', '${customer_element.item_id}')"></i>
                                </div>
                            </div>
                        </td>`;
                    }
                    else{
                        customerrowHTML += `<td class="amount-cell">
                            <div class="action-icons">
                                <div class="approve-reject">
                                    
                                </div>
                                <div class="remove">
                                    <i class="fa fa-trash trash-icon" title="remove" data-item-id="${customer_element.item_id}"></i>
                                </div>
                            </div>
                        </td>`;
                    }
                    customerRow.innerHTML = customerrowHTML
                    window.tdCount = customerRow.querySelectorAll("td").length;
                    budgetTableBody.appendChild(customerRow);

                    // Attach change event for this row for final array
                    if(defaults === "addBudget" || defaults === "prefillBudget" || defaults === "Assumption_budget"){
                        attachInputListeners(customerRow); 
                        attachInputListenersCust(customerRow);
                    }                    
                });
            });
        });
    });
    // deleted add budget Items
    document.getElementById("budgetTableBody").addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("trash-icon")) {
            const row = e.target.closest("tr");
            if (row) row.remove();
             FinalTableArr(finalArr=[])
        }
    });

    // get Final output arr
     if(defaults === "addBudget" || defaults === "prefillBudget"|| defaults === "Assumption_budget"){
        let finalArr = [];
        FinalTableArr(finalArr)
     }

     // collapse and expanse Table
    const collapseIcon = document.getElementById("collapseIcon");
    const expandIcon = document.getElementById("expandIcon");

    collapseIcon.addEventListener("click", () => {
    MaintableCollapse("collapse");
    collapseIcon.style.display = "none";
    expandIcon.style.display = "inline";
    });

    expandIcon.addEventListener("click", () => {
    MaintableCollapse("expand");
    expandIcon.style.display = "none";
    collapseIcon.style.display = "inline";
    });
    
    // Export
    document.getElementById('ExpotCsvId').addEventListener('click', function(){
        console.log(customerArr)
        downloadExport('csv', customerArr)        
    })

}

function attachInputListenersCust(row) {
    row.querySelectorAll(".customer-td").forEach(input => {
        input.addEventListener("change", () => {
            let finalArr = [];
            FinalTableArr(finalArr);       
        });
    });
}

function attachInputListeners(row) {
    row.querySelectorAll(".amount-input").forEach(input => {
        input.addEventListener("change", () => {
            let finalArr = [];
            FinalTableArr(finalArr);       
        });
    });
}

function FinalTableArr(finalArr){
    const finalArrList = document.querySelectorAll("tr.customer-row");
    finalArrList.forEach(row => {
        const finalobj = {};
        finalobj.Budget_Manager = row.getAttribute("data-budget-id");
        finalobj.Year_field = row.getAttribute("data-year");
        finalobj.Class = row.getAttribute("data-category-id");
        finalobj.Account_Name = row.getAttribute("data-account");
        finalobj.class_name = row.getAttribute("data-category")
        finalobj.budget_name = row.getAttribute("data-budgetname")
        finalobj.account_name = row.getAttribute("data-accountname")

        // customer name from input
        const customerInput = row.querySelector(".amount-input-text");
        finalobj.Customer = customerInput ? customerInput.value.trim() : "";

        // // collect month values
        row.querySelectorAll(".amount-input").forEach(input => {
            const monthNo = parseInt(input.dataset.month);
            const monthName = months[monthNo - 1];
            const rawValue = input.value.replace(/,/g, '').trim();
            finalobj[monthName] = parseFloat(rawValue) || 0;
        });

        // Actual_ values
        const actualCells = row.querySelectorAll("td.actual-cell");
        const actualDataKeys = [];
        actualCells.forEach(td => {
            const key = td.dataset.actualMonth; // "Actual_January", etc.
            const value = td.textContent.replace(/,/g, '').trim();
            finalobj[key] = parseFloat(value) || 0;
            actualDataKeys.push(key);
        });

        // Fill missing Actual_ months with 0
        Actual_months.forEach(key => {
            if (!(key in finalobj)) finalobj[key] = 0;
        });

        // push structured object
        finalArr.push(finalobj);
        window.finalArrs = finalArr;
    });
    
    // Create budget bulk API
    if(defaults === "addBudget"){
        const enter_name = document.getElementById('budgetName').value.trim();
        const enter_year = document.getElementById('budgetYear').value;
        const enter_month = document.getElementById('startMonth').value;
        const enter_period = document.getElementById('period').value;
        createBudgetButtons(finalArr, {name:enter_name, year:enter_year.toString(), month:enter_month.toString(), period : (enter_period.toLowerCase() === "monthly")? "": enter_period}, "addBudget");
    }
    else if(defaults === "prefillBudget"){
        const prefilname = document.getElementById('PreBudName').value.trim();
        const Assumname = document.getElementById('AssumName').value.trim();
        createBudgetButtons(finalArr, {name:prefilname, year:finalArr[0].Year_field, month:"January"}, "prefillBudget");
    }
    else if(defaults === "Assumption_budget"){
        const Assumname = document.getElementById('AssumName').value.trim();
        createBudgetButtons(finalArr, {name:Assumname, year:finalArr[0].Year_field, month:"January"}, "Assumption_budget");
    }
}

// Toggle budget details (expand/collapse)
function toggleBudgetDetails(budgetId) {
    const budgetRow = document.querySelector(`.budget-name[data-budget-id="${budgetId}"]`);
    const icon = budgetRow.querySelector('i');

    // Toggle icon
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');

    // Find all rows under this budget
    const childRows = document.querySelectorAll(`tr[data-budget-id="${budgetId}"]:not(.budget-row)`);

    // If currently expanded → collapse all
    const isCollapsed = Array.from(childRows).some(row => !row.classList.contains('hidden-budget'));

    if (isCollapsed) {
        // Collapse everything under this budget
        childRows.forEach(row => row.classList.add('hidden-budget'));
    } else {
        // Expand everything under this budget
        childRows.forEach(row => row.classList.remove('hidden-budget'));
    }
}

// Toggle category details (expand/collapse)
function toggleCategoryDetails(budgetId, categoryName) {
    const categoryRow = document.querySelector(`tr[data-budget-id="${budgetId}"][data-category="${categoryName}"]`);
    const icon = categoryRow.querySelector('i');

    if (icon) {
        icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    // Find all rows under this budget
    const childRowss = document.querySelectorAll(`tr[data-budget-id="${budgetId}"][data-category="${categoryName}"]:not(.category-row)`);
   
    // If currently expanded → collapse all
    const isCollapsed = Array.from(childRowss).some(row => !row.classList.contains('hidden-category'));

    if (isCollapsed) {
        // Collapse everything under this budget
        childRowss.forEach(row => row.classList.add('hidden-category'));
    } else {
        // Expand everything under this budget
        childRowss.forEach(row => row.classList.remove('hidden-category'));
    }
}

// Toggle Account details (expand/collapse)
function toggleAccountDetails(budgetId, AccountID) {
    
    const customerRows = document.querySelectorAll(
        `tr[data-budget-id="${budgetId}"][data-account="${AccountID}"].customer-row`
    );
    customerRows.forEach(row => row.classList.toggle('collapsed'));
}

// Formatter: 100000 → "1,00,000"
function formatIndia(x) {
    if (!x) return "";
    return Number(x).toLocaleString('en-IN');
}

// Parser: "1,00,000" → 100000
function parseNumber(x) {
    if (!x) return 0;
    return parseFloat(x.replace(/,/g, '')) || 0;
}

// Attach to all .amount-input fields
function handleFocusIn(e) {
    const cell = e.target.closest('.amount-cell:not(.editing-new-row), .customer-td:not(.editing-new-row)');
    if (!cell) return;

    if (e.target.classList.contains('amount-input')) {
        cell.classList.add('editing');
        const val = parseNumber(e.target.value);
        e.target.value = val ? val.toFixed(2) : "";
    }

    if (e.target.classList.contains('amount-input-text')) {
        cell.classList.add('editing');
    }

    // Show action icons for all editing cells
    const editingCells = document.querySelectorAll('.editing');
    editingCells.forEach(editCell => {
        const row = editCell.closest('tr');
        const rowAction = row.querySelector('.approve-reject');
        if (!rowAction) return;

        // Clear previous buttons
        rowAction.innerHTML = "";
        
        // Create buttons
        if(defaults === "budgetItems"){
            const updateBtn = document.createElement('i');
            updateBtn.className = 'fa fa-check update-btn';
            updateBtn.title = 'Update';
            updateBtn.style.color = 'green';
            // Append buttons
            rowAction.appendChild(updateBtn);
            // Add event listeners
            updateBtn.addEventListener('click', () => {
                const updatedCustomerData = {};

                // Customer name
                const customerInput = row.querySelector('.amount-input-text');
                updatedCustomerData.Customer = customerInput.value;

                // Months (Jan–Dec)
                months.forEach((month, idx) => {
                    const monthInput = row.querySelector(`.amount-cell input[data-month="${idx+1}"]`);
                    updatedCustomerData[month] = parseNumber(monthInput.value) || "0";
                });

                UpdateRecordByID('Budget_Manager_Items_Js', row.dataset.itemid, updatedCustomerData);
            });
        }

        const cancelBtn = document.createElement('i');
        cancelBtn.className = 'fa fa-times cancel-btn';
        cancelBtn.title = 'Cancel';
        cancelBtn.style.color = 'red';

        // Append buttons
        rowAction.appendChild(cancelBtn);

        cancelBtn.addEventListener('click', () => {
            cancelRow(cancelBtn);      
        });
    });
}
document.addEventListener('focusin', handleFocusIn);

// New function to trigger focusout on the row
function cancelRow(icon) {
    const row = icon.closest('tr');

    // Find all inputs in that row
    const inputs = row.querySelectorAll('.amount-input, .amount-input-text');
    inputs.forEach(input => {
        // Remove the editing class
        input.closest('.amount-cell')?.classList.remove('editing');
        input.closest('.customer-td')?.classList.remove('editing');

        // Trigger focusout logic manually
        const val = parseNumber(input.value);
        if (input.classList.contains('amount-input')) {
            input.value = val ? formatIndia(val) : "";
        }
    });

    // Optionally, remove the action icons
    const rowAction = row.querySelector('.approve-reject');
    if (rowAction) rowAction.innerHTML = "";
}

// Validate only numbers + decimal
document.addEventListener('input', e => {
    if (e.target.classList.contains('amount-input')) {
        const val = e.target.value;
        // Allow only digits and at most one decimal point
        if (!/^\d*\.?\d*$/.test(val)) {
            alert("Only numbers and decimals are allowed!");
            // Remove last invalid character
            e.target.value = val.replace(/[^0-9.]/g, '');
        }
    }
});

// Stop add row collapse and add new row.
document.addEventListener('DOMContentLoaded', () => {
  ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, function (e) {
      const btn = e.target.closest('.fill-budget-value');
      if (btn) {
        // stop ancestor handlers (capture & bubble)
        e.stopPropagation();
        e.preventDefault();

        // Only run on click, not on pointerdown/mousedown/touchstart
        if (evt === 'click') {
            const td = btn.closest('td');
            const tr = td.closest('tr');

            let budgetId = tr.dataset.budgetId;
            let budgetname = tr.dataset.budgetname;
            let year = tr.dataset.year;
            let category = tr.dataset.category;
            let categoryId = tr.dataset.categoryId;
            let account = tr.dataset.account;
            let account_name = tr.dataset.accountname;
            let itemID = tr.dataset.item_id;
        
            // Create new row
            const newRow = document.createElement('tr');
            newRow.classList.add('customer-row');
            newRow.setAttribute('data-budget-id', budgetId);
            newRow.setAttribute('data-budgetname', budgetname);
            newRow.setAttribute('data-year', year);
            newRow.setAttribute('data-category', category);
            newRow.setAttribute('data-category-id', categoryId);
            newRow.setAttribute('data-account', account);
            newRow.setAttribute('data-accountname', account_name);
            newRow.setAttribute('data-itemid', itemID);

            newRow.innerHTML = `
               <td></td>
                <td colspan="3" class="customer-td editing-new-row">
                <a class="autofill-value ms-auto" href="#" 
                data-action="autofill-row" 
                data-itemid ="${itemID}">
                    <small>Autofill</small> 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon align-middle">
                        <path fill="#208EFF" d="M5 256c0 138.6 112.4 251 251 251s251-112.4 251-251S394.6 5 256 5 5 117.4 5 256zm249.2-130.7l113 113c4.9 4.9 7.3 11.3 7.3 17.7 0 6.4-2.4 12.8-7.3 17.7l-113 113c-9.8 9.8-25.6 9.8-35.4 0-9.8-9.8-9.8-25.6 0-35.4l95.4-95.4-95.4-95.4c-9.8-9.8-9.8-25.6 0-35.4 9.8-9.6 25.6-9.6 35.4.2z">
                        </path>
                    </svg>
                </a>
                <input type="text" class="amount-input-text" value="" 
                    data-budget-id="${budgetId}" 
                    data-year="${year}" 
                    data-category="${category}" 
                    data-category-id="${categoryId}" 
                    data-account="${account}" 
                    >
                </td>`
                if(defaults === "addBudget" || defaults === "prefillBudget" || defaults === "Assumption_budget")
                {
                    var addTD = window.tdCount - 15;
                    for (let index = 0; index < addTD; index++) {
                        newRow.innerHTML +=`<td class="amount-cell editing-new-row"></td>`                   
                    }
                }
                months.forEach((month, idx) => {
                 newRow.innerHTML += `
                    <td class="amount-cell editing-new-row">
                    <input type="text" class="amount-input"
                        value="" 
                        data-budget-id="${budgetId}" 
                        data-year="${year}" 
                        ata-category="${category}" 
                        data-category-id="${categoryId}" 
                        data-account="${account}"
                        data-month="${idx + 1}">
                    </td>
                `;
                });
                newRow.innerHTML += `<td class="amount-cell">
                    <div class="action-icons">
                        <div class="approve-reject">
                            ${
                                (defaults === "budgetItems")? `<i class="fa fa-plus update-btn" title="Save"></i>`:``
                            }
                        </div>
                        <div class="remove">
                            <i class="fa fa-trash remove-row" title="Remove Item"></i>
                        </div>
                    </div>
                </td>`;

            // Insert the new row just after the current row
            tr.insertAdjacentElement('afterend', newRow);
            if(defaults === "addBudget" || defaults === "prefillBudget" || defaults === "Assumption_budget"){
                attachInputListeners(newRow); 
                attachInputListenersCust(newRow);
                FinalTableArr(finalArr=[]);      
            } 
            // Attach listener for update button in this new row
            if(defaults === "budgetItems"){
                const updateBtn = newRow.querySelector('.update-btn');
                updateBtn.addEventListener('click', async () => {
                    const updatedCustomerData = {};

                    const customerInput = newRow.querySelector('.amount-input-text');
                    updatedCustomerData.Customer = customerInput.value;
                    updatedCustomerData.budgetId = budgetId;
                    updatedCustomerData.year = year;
                    updatedCustomerData.categoryID = categoryId;
                    updatedCustomerData.account = account;

                    months.forEach((month, idx) => {
                        const monthInput = newRow.querySelector(`.amount-cell input[data-month="${idx+1}"]`);
                        updatedCustomerData[month] = parseNumber(monthInput.value) || "0";
                    });

                    const itemAddResp = await POSTRecord('Budget_Manager_Items', updatedCustomerData);
                    if(itemAddResp.code == 3000)
                    {
                        let AllFetchArr = [];
                        showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr , defaults="budgetItems"))
                        errorMsg("Item Added.", "green")
                    }
                    else{
                        errorMsg("Item Add failed.", "red")
                    }
                });
            }
        }
      }
    }, true); // capture phase
  });
});
//removw rows work 
document.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.remove-row');
  if (removeBtn) {
    const tr = removeBtn.closest('tr'); // get the row
    tr.remove(); // remove it from the DOM
        FinalTableArr(finalArr=[]);      
  }
});

// Message Text
function errorMsg(text, color){
    const error_msg = document.getElementById("error-msdid");
    error_msg.innerHTML = text
    error_msg.style.display = "block";
    error_msg.style.color = color;

    setTimeout(() => {
        error_msg.innerHTML = "";
        error_msg.style.display = "none"; // hide again after 2 sec
    }, 5000);
}

// main table overall collapse
function MaintableCollapse(action = "collapse"){
    const allRows = document.querySelectorAll(".category-row, .account-row, .customer-row");
    if (action === "collapse") {
        allRows.forEach(row => row.classList.add("hidden-budget"));
    } else {
        allRows.forEach(row => row.classList.remove("hidden-budget"));
    }
}

// Download
function toggleDropdownActual(element) {
    const container = element.parentElement;
    container.classList.toggle('show');
}
window.onclick = function(event) {
  if (!event.target.matches('.download-link')) {
    document.querySelector('.dropdown').classList.remove('show');
  }
}
function downloadExport(type, inputArr) {
  if(type === "csv"){
    downloadJSONAsCSV(inputArr, 'Budget.csv');
  }
  else if(type === "pdf"){
    // downloadPDF()
  }
  document.querySelector('.dropdown').classList.remove('show');
}  

// Export csv
function downloadJSONAsCSV(data, filename) {
     // Sort data
    data.sort((a, b) => {
        // Year ascending
        if (a.Year_field !== b.Year_field) return a.Year_field - b.Year_field;
        // Budget name ascending
        if (a.budgetName !== b.budgetName) return a.budgetName.localeCompare(b.budgetName);
        // Category order: Revenue first, then Expense
        const categoryOrder = { "REVENUE": 1, "EXPENSE": 2 };
        if (a.class !== b.class) return (categoryOrder[a.class] || 99) - (categoryOrder[b.class] || 99);
        // Account name ascending
        if (a.accountName !== b.accountName) return a.accountName.localeCompare(b.accountName);
        // Customer ascending
        return a.customer.localeCompare(b.customer);
    });

    const headers = ["Year", "Budget Name", "Category", "Account Name", "Customer", ...months];
    const csvRows = [];
    csvRows.push(headers.join(','));

    data.forEach(row => {
        const monthValues = months.map(m => row[m] !== undefined ? row[m] : 0);
        const rowData = [
            row.Year_field,
            row.budgetName,
            row.class,
            row.accountName,
            row.customer,
            ...monthValues
        ];
        csvRows.push(rowData.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// async function downloadPDF() {
//     const element = document.getElementById("budgetTablId");
//     const { jsPDF } = window.jspdf;

//     // Capture table as canvas
//     const canvas = await html2canvas(element, { scale: 2 , logging: false});
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF({
//         orientation: 'landscape',
//         unit: 'pt',
//         format: 'a4'
//     });

//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();

//     const imgWidth = canvas.width;
//     const imgHeight = canvas.height;
//     const scale = pageWidth / imgWidth;
//     const scaledHeight = imgHeight * scale;

//     let position = 0;

//     // Split image into multiple pages if height > pageHeight
//     while (position < scaledHeight) {
//         pdf.addImage(imgData, 'PNG', 0, -position, pageWidth, scaledHeight);
//         position += pageHeight;
//         if (position < scaledHeight) pdf.addPage();
//     }

//     pdf.save("Budget.pdf");
// }