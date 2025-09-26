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
    
    console.log(classArr);

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
            toggleBudgetDetails(budget.id);
        });

        // Render class name

        // prepare a Set of IDs from arr2
        let arr2Ids = new Set(classArr.map(a => a.budgetid));
        console.log(arr2Ids);
        
        // classArr.forEach(classObj => {
        // if (classObj.has(budgetN.id)) {
        //     console.log("Matched:", classObj); 
        // } else {
        //     console.log("Not matched:");
        // }
        // });

    });
}