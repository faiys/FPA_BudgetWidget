// Render budget Table
function RenderBudgetTable(arrData){
    budgetTableBody.innerHTML = '';
    // arrData.sort((a, b) => b.Year_field - a.Year_field);
    console.log("arrData - ",arrData);

    // Budget name Arr
    let distinctByBudgetName = [
    ...new Map(arrData.map(item => [item.Budget_Manager.ID, item])).values()
    ];
    let BudgetNameArr = distinctByBudgetName.map(item => ({
        id: item.Budget_Manager.ID,
        name: item.Budget_Manager.Name
    }));

    // Remove duplicate budget ID and class ID
    let distinctByClassBudget = [
    ...new Map(
        arrData.map(item => [
        item.Class.ID + "_" + item.Budget_Manager.ID, // 👈 composite key
        item
        ])
    ).values()
    ];
    let classArr = distinctByClassBudget.map(item => ({
        id: item.Class.ID,
        class: item.Class.Class,
        budgetid: item.Budget_Manager.ID
    }));

    // Remove duplicate budget ID and class and Account Name
    let distinctByaccname = [
    ...new Map(arrData.map(item => [item.Account_Name.ID+ "_" +item.Class.ID+ "_" + item.Budget_Manager.ID, item])).values()
    ];
    let CoaArr = distinctByaccname.map(item => ({
        id: item.Account_Name.ID,
        accountName: item.Account_Name.Account_Name,
        classid: item.Class.ID,
        budgetid: item.Budget_Manager.ID
    }));

    console.log(CoaArr);

    // Render budget name with distinct
    BudgetNameArr.forEach(budgetN => {
        // Budget name row
        const budgetRow = document.createElement('tr');
        budgetRow.classList.add('budget-row');
        budgetRow.innerHTML = `
            <td colspan="14">
                <div class="budget-name" data-budget-id="${budgetN.id}">
                    <i class="fas fa-chevron-down"></i> ${budgetN.name}
                </div>
            </td>
        `;
        budgetTableBody.appendChild(budgetRow);

        // Add click event to toggle budget details
        const budgetNameDiv = budgetRow.querySelector('.budget-name');
        budgetNameDiv.addEventListener('click', function() {
            toggleBudgetDetails(budgetN.id);
        });

        // Render class name
        // Filter based on the budget ID in this class arr
        let Class_filtered = classArr.filter(item => item.budgetid === budgetN.id);
        Class_filtered.forEach(cls_element => {
            const categoryRow = document.createElement('tr');
            categoryRow.classList.add('category-row');
            categoryRow.setAttribute('data-budget-id', cls_element.budgetid);

            const categoryIcon = cls_element.class === 'REVENUE' ? 
                '<i class="fas fa-arrow-up" style="color: var(--success-green);"></i>' : 
                '<i class="fas fa-arrow-down" style="color: var(--danger-red);"></i>';

            categoryRow.innerHTML = `
                <td></td>
                <td class="${cls_element.class}-category" data-category="${cls_element.class}">
                    ${categoryIcon} ${cls_element.class}
                </td>                        
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
                <td class="amount-cell"></td>
            `;
            budgetTableBody.appendChild(categoryRow);

            // Add click event to toggle category details
            const categoryCell = categoryRow.querySelector(`.${cls_element.class}-category`);
            categoryCell.addEventListener('click', function() {
                toggleCategoryDetails(cls_element.budgetid, cls_element.class);
            });

             // Render Account name
            // Filter based on the budget ID and class in this account arr
            let Account_filtered = CoaArr.filter(item => item.budgetid === cls_element.budgetid && item.classid === cls_element.id);
            Account_filtered.forEach(Account_element => {
                const accountRow = document.createElement('tr');
                accountRow.classList.add('account-row');
                accountRow.setAttribute('data-budget-id', Account_element.budgetid);
                accountRow.setAttribute('data-category', cls_element.class);
                
                accountRow.innerHTML = `
                    <td></td>
                    <td class="${Account_element.accountName}-category">
                        ${Account_element.accountName}
                    </td>                        
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                    <td class="amount-cell"></td>
                `;
                 budgetTableBody.appendChild(accountRow);

            });



        });
    });
}

// Toggle budget details (expand/collapse)
function toggleBudgetDetails(budgetId) {
    const budgetRow = document.querySelector(`.budget-name[data-budget-id="${budgetId}"]`).closest('tr');
    const icon = budgetRow.querySelector('i');
    
    // Toggle icon
    if (icon.classList.contains('fa-chevron-down')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
    
    // Toggle visibility of category rows for this budget
    const categoryRows = document.querySelectorAll(`tr[data-budget-id="${budgetId}"], tr[data-budget-id="${budgetId}"]`);
     console.log("categoryRows - ", categoryRows)
    categoryRows.forEach(row => {
        row.classList.toggle('collapsed');
    });

    // Toggle visibility of Account rows for this budget
    // const accountRows = document.querySelectorAll(`tr[data-budget-id="${budgetId}"]`);
    // console.log("accountRows = ",accountRows)
    // accountRows.forEach(row => {
    //     row.classList.toggle('collapsed');
    // });
}

// Toggle category details (expand/collapse)
function toggleCategoryDetails(budgetId, categoryName) {
    const categoryRow = document.querySelector(`tr[data-budget-id="${budgetId}"] .${categoryName}-category`).closest('tr');
    const icon = categoryRow.querySelector('i');
    
    // Toggle icon rotation
    if (icon.classList.contains('fa-arrow-up') || icon.classList.contains('fa-arrow-down')) {
        icon.style.transform = icon.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
    }
    
    // Toggle visibility of account rows for this category
    const accountRows = document.querySelectorAll(`tr[data-budget-id="${budgetId}"][data-category="${categoryName}"]`);
    accountRows.forEach(row => {
        row.classList.toggle('collapsed');
    });
}