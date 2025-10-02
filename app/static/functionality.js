const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const Actual_months = ['JActual_anuary','Actual_February','Actual_March','Actual_April','Actual_May','Actual_June','Actual_July','Actual_August','Actual_September','Actual_October','Actual_November','Actual_December'];
const accountColor = "style='background:#f5f0eb'";

// Render budget Table
async function RenderBudgetTable(ReportName, recordCursor, AllFetchArr, defaults){
    let arrData;
    if(defaults == true && ReportName){
         arrData = await fetch(ReportName, recordCursor, AllFetchArr);
    }
    else{
        arrData = AllFetchArr;
    }
    budgetTableBody.innerHTML = '';
    arrData.sort((a, b) => b.Year_field - a.Year_field);

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
    headerRow.innerHTML = `<th colspan="4"></th>`;
    if(defaults === false){
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
                    <i class="fas fa-chevron-down"></i> ${budgetN.name}
                </div>
            </td></td>
        `;
        if(defaults === false){
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
            if(defaults === false){
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
                accountRow.innerHTML = `
                    <td ${accountColor}></td>
                    <td colspan="3" class="account-td ${"id-"+Account_element.accountId}-category" ${accountColor}>
                        ${Account_element.accountName}
                        <a class="fill-budget-value ms-auto" href="#" data-action="add-row">
                            <small>Add row</small> 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon align-middle">
                                <path fill="#208EFF" d="M5 256c0 138.6 112.4 251 251 251s251-112.4 251-251S394.6 5 256 5 5 117.4 5 256zm249.2-130.7l113 113c4.9 4.9 7.3 11.3 7.3 17.7 0 6.4-2.4 12.8-7.3 17.7l-113 113c-9.8 9.8-25.6 9.8-35.4 0-9.8-9.8-9.8-25.6 0-35.4l95.4-95.4-95.4-95.4c-9.8-9.8-9.8-25.6 0-35.4 9.8-9.6 25.6-9.6 35.4.2z">
                                </path>
                            </svg>
                        </a>
                    </td>                        
                `;
                if(defaults === false){
                    Object.keys(Account_element).forEach(key => {
                        if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                            accountRow.innerHTML += `<td class="amount-cell">${formatIndia(Account_element[key])}</td>`;
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
                    customerRow.setAttribute('data-year', budgetN.year);
                    customerRow.setAttribute('data-category', cls_element.class);
                    customerRow.setAttribute('data-category-id', cls_element.classId);
                    customerRow.setAttribute('data-account', Account_element.accountId);
                    customerRow.setAttribute('data-itemid', customer_element.item_id);
                    
                    let customerrowHTML= `
                    <td></td>
                    <td colspan="3" class="customer-td">
                        <input type="text" class="amount-input-text" value="${customer_element.customer}" 
                            data-budget-id="${customer_element.budgetId}" 
                            data-category="${cls_element.class}" 
                            data-categoryId="${Account_element.classId}" 
                            data-account="${Account_element.accountId}" 
                        >
                    </td>`
                    if(defaults === false){
                        Object.keys(customer_element).forEach(key => {
                            if (key.startsWith("Actual_") && parseFloat(budgetN[key]) > 0) {
                                customerrowHTML += `<td class="amount-cell">${formatIndia(customer_element[key])}</td>`;
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
                    if(defaults === true){
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

                });
            });
        });
    });
    // deleted add budget Items
    document.getElementById("budgetTableBody").addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("trash-icon")) {
        const row = e.target.closest("tr");
        if (row) row.remove();
    }
});
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
document.addEventListener('focusin', e => {
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
        if(defaults === true){
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
});

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

// document.addEventListener('focusout', e => {
//     if (e.target.classList.contains('amount-input')) {
//         // remove highlight
//         // e.target.closest('.amount-cell')?.classList.remove('editing');

//         const val = parseNumber(e.target.value);
//         e.target.value = val ? formatIndia(val) : "";
//     }
// });

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
            let year = tr.dataset.year;
            let category = tr.dataset.category;
            let categoryId = tr.dataset.categoryId;
            let account = tr.dataset.account;
        
            // Create new row
            const newRow = document.createElement('tr');
            newRow.classList.add('customer-row');
            newRow.setAttribute('data-budget-id', budgetId);
            newRow.setAttribute('data-year', year);
            newRow.setAttribute('data-category', category);
            newRow.setAttribute('data-category-id', categoryId);
            newRow.setAttribute('data-account', account);
            newRow.innerHTML = `
               <td></td>
                <td colspan="3" class="customer-td editing-new-row">
                <input type="text" class="amount-input-text" value="" 
                    data-budget-id="${budgetId}" 
                    data-year="${year}" 
                    data-category="${category}" 
                    data-category-id="${categoryId}" 
                    data-account="${account}" 
                    >
                </td>`
                if(defaults === false)
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
                                (defaults === true)? `<i class="fa fa-plus update-btn" title="Save"></i>`:``
                            }
                        </div>
                        <div class="remove">
                            <i class="fa fa-trash remove-row" title="Remove Item"></i>
                        </div>
                    </div>
                </td>`;

            // Insert the new row just after the current row
            tr.insertAdjacentElement('afterend', newRow);
            // Attach listener for update button in this new row
            if(defaults === true){
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
                        RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr , defaults=true)
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
  }
});

// Message Text
function errorMsg(text, color){
    error_msg.innerHTML = text
    error_msg.style.display = "block";
    error_msg.style.color = color;

    setTimeout(() => {
        error_msg.innerHTML = "";
        error_msg.style.display = "none"; // hide again after 2 sec
    }, 5000);
}

