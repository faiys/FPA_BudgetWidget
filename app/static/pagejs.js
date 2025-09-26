// Sample data for the budget table
const sampleData = {
    budgets: [
        {
            id: 1,
            name: "Q1 Marketing Budget",
            categories: [
                {
                    name: "Income",
                    type: "income",
                    accounts: [
                        { name: "Advertising Revenue", amounts: [5000, 5500, 6000, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
                        { name: "Sponsorships", amounts: [2000, 2200, 2400, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
                    ]
                },
                {
                    name: "Expense",
                    type: "expense",
                    accounts: [
                        { name: "Digital Ads", amounts: [1500, 1600, 1700, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
                        { name: "Content Creation", amounts: [1000, 1100, 1200, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
                        { name: "Events", amounts: [500, 600, 700, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
                    ]
                }
            ]
        },
        {
            id: 2,
            name: "Operations Budget",
            categories: [
                {
                    name: "Income",
                    type: "income",
                    accounts: [
                        { name: "Service Revenue", amounts: [12000, 12500, 13000, 13500, 14000, 14500, 0, 0, 0, 0, 0, 0] }
                    ]
                },
                {
                    name: "Expense",
                    type: "expense",
                    accounts: [
                        { name: "Salaries", amounts: [8000, 8000, 8000, 8000, 8000, 8000, 0, 0, 0, 0, 0, 0] },
                        { name: "Office Rent", amounts: [2000, 2000, 2000, 2000, 2000, 2000, 0, 0, 0, 0, 0, 0] },
                        { name: "Utilities", amounts: [500, 500, 500, 500, 500, 500, 0, 0, 0, 0, 0, 0] }
                    ]
                }
            ]
        }
    ]
};

// DOM Elements
const addBudgetBtn = document.getElementById('addBudgetBtn');
const addAssumptionBtn = document.getElementById('addAssumptionBtn');
const budgetForm = document.getElementById('budgetForm');
const assumptionForm = document.getElementById('assumptionForm');
const closeBudgetForm = document.getElementById('closeBudgetForm');
const closeAssumptionForm = document.getElementById('closeAssumptionForm');
const budgetFormContent = document.getElementById('budgetFormContent');
const assumptionFormContent = document.getElementById('assumptionFormContent');
const budgetTableBody = document.getElementById('budgetTableBody');
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');
const closeFilterPanel = document.getElementById('closeFilterPanel');
const overlay = document.getElementById('overlay');
const addRowBtn = document.getElementById('addRowBtn');
const applyFilterBtn = document.getElementById('applyFilterBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderBudgetTable();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Form toggle buttons
    addBudgetBtn.addEventListener('click', () => toggleForm(budgetForm, assumptionForm));
    addAssumptionBtn.addEventListener('click', () => toggleForm(assumptionForm, budgetForm));
    
    // Close form buttons
    closeBudgetForm.addEventListener('click', () => closeForm(budgetForm));
    closeAssumptionForm.addEventListener('click', () => closeForm(assumptionForm));
    
    // Form submissions
    budgetFormContent.addEventListener('submit', handleBudgetSubmit);
    assumptionFormContent.addEventListener('submit', handleAssumptionSubmit);
    
    // Filter panel
    // filterBtn.addEventListener('click', openFilterPanel);
    // closeFilterPanel.addEventListener('click', closeFilterPanelFunc);
    // overlay.addEventListener('click', closeFilterPanelFunc);
    // applyFilterBtn.addEventListener('click', applyFilters);
    
    // Add row button
    // addRowBtn.addEventListener('click', addNewRow);
}

// Toggle form visibility with animation
function toggleForm(formToShow, formToHide) {
    // Close the other form if it's open
    if (formToHide.classList.contains('active')) {
        closeForm(formToHide);
        // Small delay to allow the close animation to complete
        setTimeout(() => {
            openForm(formToShow);
        }, 300);
    } else {
        openForm(formToShow);
    }
}

// Open form with animation
function openForm(form) {
    form.classList.add('active');
}

// Close form with animation
function closeForm(form) {
    form.classList.remove('active');
    // Reset form after animation completes
    setTimeout(() => {
        form.querySelector('form').reset();
    }, 500);
}

// Handle budget form submission
function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const year = document.getElementById('year').value;
    const startMonth = document.getElementById('startMonth').value;
    const period = document.getElementById('period').value;
    const budgetName = document.getElementById('budgetName').value;
    
    // Validation
    if (!year || !startMonth || !budgetName) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check if start month + period exceeds December
    const endMonth = parseInt(startMonth) + parseInt(period) - 1;
    if (endMonth > 11) {
        alert('Start month cannot be later than end month.');
        return;
    }
    
    // Create new budget object
    const newBudget = {
        id: sampleData.budgets.length + 1,
        name: budgetName,
        categories: [
            {
                name: "Income",
                type: "income",
                accounts: [
                    { name: "New Income Source", amounts: Array(12).fill(0) }
                ]
            },
            {
                name: "Expense",
                type: "expense",
                accounts: [
                    { name: "New Expense Item", amounts: Array(12).fill(0) }
                ]
            }
        ]
    };
    
    // Enable only the months in the selected period
    for (let i = 0; i < 12; i++) {
        if (i < parseInt(startMonth) || i > endMonth) {
            // These months should be disabled
            newBudget.categories[0].accounts[0].amounts[i] = null;
            newBudget.categories[1].accounts[0].amounts[i] = null;
        }
    }
    
    // Add to sample data
    sampleData.budgets.push(newBudget);
    
    // Re-render table
    renderBudgetTable();
    
    // Close form
    closeForm(budgetForm);
    
    // Show success message
    alert('Budget added successfully!');
}

// Handle assumption form submission
function handleAssumptionSubmit(e) {
    e.preventDefault();
    
    const year = document.getElementById('assumptionYear').value;
    const type = document.getElementById('assumptionType').value;
    const value = document.getElementById('assumptionValue').value;
    
    // Validation
    if (!year || !value) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In a real application, we would save this data
    alert(`Assumption added: ${type} of ${value}% for ${year}`);
    
    // Close form
    closeForm(assumptionForm);
}

// Render the budget table
function renderBudgetTable() {
    budgetTableBody.innerHTML = '';
    
    sampleData.budgets.forEach(budget => {
        // Budget name row
        // const budgetRow = document.createElement('tr');
        // budgetRow.classList.add('budget-row');
        // budgetRow.innerHTML = `
        //     <td colspan="14">
        //         <div class="budget-name" data-budget-id="${budget.id}">
        //             <i class="fas fa-chevron-down"></i> ${budget.name}
        //         </div>
        //     </td>
        // `;
        // budgetTableBody.appendChild(budgetRow);
        
        // Add click event to toggle budget details
        // const budgetNameDiv = budgetRow.querySelector('.budget-name');
        // budgetNameDiv.addEventListener('click', function() {
        //     toggleBudgetDetails(budget.id);
        // });
        
        // Category rows
        budget.categories.forEach(category => {
            // Category header row
            const categoryRow = document.createElement('tr');
            categoryRow.classList.add('category-row');
            categoryRow.setAttribute('data-budget-id', budget.id);
            
            const categoryIcon = category.type === 'income' ? 
                '<i class="fas fa-arrow-up" style="color: var(--success-green);"></i>' : 
                '<i class="fas fa-arrow-down" style="color: var(--danger-red);"></i>';
            
            categoryRow.innerHTML = `
                <td></td>
                <td class="${category.type}-category" data-category="${category.name}">
                    ${categoryIcon} ${category.name}
                </td>                        
                <td class="amount-cell">${calculateCategoryTotal(category, 0)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 1)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 2)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 3)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 4)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 5)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 6)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 7)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 8)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 9)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 10)}</td>
                <td class="amount-cell">${calculateCategoryTotal(category, 11)}</td>
            `;
            budgetTableBody.appendChild(categoryRow);
            
            // Add click event to toggle category details
            const categoryCell = categoryRow.querySelector(`.${category.type}-category`);
            categoryCell.addEventListener('click', function() {
                toggleCategoryDetails(budget.id, category.name);
            });
            
            // Account rows
            category.accounts.forEach(account => {
                const accountRow = document.createElement('tr');
                accountRow.classList.add('account-row');
                accountRow.setAttribute('data-budget-id', budget.id);
                accountRow.setAttribute('data-category', category.name);
                
                let accountCells = `
                    <td></td>
                    <td class="account-name">${account.name}</td>
                `;
                
                // Create amount cells for each month
                for (let i = 0; i < 12; i++) {
                    if (account.amounts[i] === null) {
                        accountCells += `<td class="amount-cell disabled-amount">-</td>`;
                    } else {
                        accountCells += `
                            <td class="amount-cell">
                                <input type="number" class="amount-input" value="${account.amounts[i]}" 
                                        data-budget-id="${budget.id}" 
                                        data-category="${category.name}" 
                                        data-account="${account.name}" 
                                        data-month="${i}">
                                <div class="amount-actions">
                                    <button class="btn-amount btn-confirm"><i class="fas fa-check"></i></button>
                                    <button class="btn-amount btn-cancel"><i class="fas fa-times"></i></button>
                                </div>
                            </td>
                        `;
                    }
                }
                
                accountRow.innerHTML = accountCells;
                budgetTableBody.appendChild(accountRow);
            });
        });
    });
    
    // Add event listeners to amount inputs
    addAmountInputListeners();
}

// Calculate total for a category in a specific month
function calculateCategoryTotal(category, monthIndex) {
    let total = 0;
    category.accounts.forEach(account => {
        if (account.amounts[monthIndex] !== null) {
            total += account.amounts[monthIndex] || 0;
        }
    });
    return total === 0 ? '-' : total.toLocaleString();
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
    const categoryRows = document.querySelectorAll(`tr[data-budget-id="${budgetId}"]`);
    categoryRows.forEach(row => {
        row.classList.toggle('collapsed');
    });
}

// Toggle category details (expand/collapse)
function toggleCategoryDetails(budgetId, categoryName) {
    const categoryRow = document.querySelector(`tr[data-budget-id="${budgetId}"] .${categoryName.toLowerCase()}-category`).closest('tr');
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

// Add event listeners to amount inputs
function addAmountInputListeners() {
    const amountInputs = document.querySelectorAll('.amount-input');
    amountInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.querySelector('.amount-actions').style.opacity = '1';
        });
        
        input.addEventListener('blur', function() {
            // Hide actions after a delay to allow button clicks
            setTimeout(() => {
                this.parentElement.querySelector('.amount-actions').style.opacity = '0';
            }, 200);
        });
        
        // Confirm button
        const confirmBtn = input.parentElement.querySelector('.btn-confirm');
        confirmBtn.addEventListener('click', function() {
            updateAmount(input);
            input.parentElement.querySelector('.amount-actions').style.opacity = '0';
        });
        
        // Cancel button
        const cancelBtn = input.parentElement.querySelector('.btn-cancel');
        cancelBtn.addEventListener('click', function() {
            // Reset to original value
            const budgetId = input.getAttribute('data-budget-id');
            const category = input.getAttribute('data-category');
            const account = input.getAttribute('data-account');
            const month = parseInt(input.getAttribute('data-month'));
            
            // Find the original value
            const budget = sampleData.budgets.find(b => b.id == budgetId);
            const categoryObj = budget.categories.find(c => c.name === category);
            const accountObj = categoryObj.accounts.find(a => a.name === account);
            
            input.value = accountObj.amounts[month];
            input.parentElement.querySelector('.amount-actions').style.opacity = '0';
        });
    });
}

// Update amount in the data model
function updateAmount(input) {
    const budgetId = input.getAttribute('data-budget-id');
    const category = input.getAttribute('data-category');
    const account = input.getAttribute('data-account');
    const month = parseInt(input.getAttribute('data-month'));
    const newValue = parseFloat(input.value) || 0;
    
    // Find and update the value in sampleData
    const budget = sampleData.budgets.find(b => b.id == budgetId);
    const categoryObj = budget.categories.find(c => c.name === category);
    const accountObj = categoryObj.accounts.find(a => a.name === account);
    
    accountObj.amounts[month] = newValue;
    
    // Update the category total display
    updateCategoryTotals(budgetId, category, month);
}

// Update category totals after amount change
function updateCategoryTotals(budgetId, categoryName, monthIndex) {
    const budget = sampleData.budgets.find(b => b.id == budgetId);
    const category = budget.categories.find(c => c.name === categoryName);
    const total = calculateCategoryTotal(category, monthIndex);
    
    // Find the category row and update the total
    const categoryRow = document.querySelector(`tr[data-budget-id="${budgetId}"] .${categoryName.toLowerCase()}-category`).closest('tr');
    const totalCell = categoryRow.querySelectorAll('.amount-cell')[monthIndex];
    totalCell.textContent = total === '0' ? '-' : total;
}