const autofillMethod = document.getElementById('autofillMethod');
const firstPeriodContainer = document.getElementById('firstPeriodContainer');
const firstPeriodAmount = document.getElementById('firstPeriodAmount');
const janValue = document.getElementById('janValue');
const febValue = document.getElementById('febValue');
const marValue = document.getElementById('marValue');
const aprValue = document.getElementById('aprValue');
const applyBtn = document.getElementById('applyBtn');

const autofill_Table_accountname = document.getElementById("autofill-accountname");
const autofill_Table_amount = document.getElementById("autofill-amountInput");
const autofillPercentageInput = document.getElementById("autofill-percentageInput");
const autofillpercentageInpuContainer = document.getElementById('autofillpercentageInpuContainer');
let finalMonthArr = [];

// Initialize once at the top close Popup
const autofillModalEl = document.getElementById('autofillModal');
const autofillModal = new bootstrap.Modal(autofillModalEl, {
    backdrop: true,
    keyboard: true
});


// Autofill popup

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.autofill-value');
    if (btn) {

        const td = btn.closest('td');
        const tr = td.closest('tr');
        const inputs = tr.querySelectorAll('input');
        resetAutofillPop()

        currentInputArr = [];
        inputs.forEach((input, idx) => {
            // if (idx < 2) { 
                currentInputArr.push(input.value);
            // }
        });
        const firstMonthval = parseNumber(currentInputArr[1]);
        autofill_Table_accountname.innerHTML = currentInputArr[0];
        autofill_Table_amount.value = firstMonthval;


        updatePreview();

        autofill_Table_amount.addEventListener('input', updatePreview);
        autofillMethod.addEventListener('change', function() {
        // Show/hide first period amount based on selection
            if (this.value === 'adjustment' || this.value === 'adj-percentage') {
                firstPeriodContainer.style.display = 'block';
            } else {
                firstPeriodContainer.style.display = 'none';
            }
            if (this.value === 'fixed-percentage' || this.value === 'adj-percentage') {
                autofillpercentageInpuContainer.style.display = 'block';
            } else {
                autofillpercentageInpuContainer.style.display = 'none';
            }
            updatePreview();
        });
        firstPeriodAmount.addEventListener('input', updatePreview);
        autofillPercentageInput.addEventListener('input', updatePreview);
        
        // let budgetId = tr.dataset.budgetId;
        // let budgetname = tr.dataset.budgetname;
        // let year = tr.dataset.year;
        // let category = tr.dataset.category;
        // let categoryId = tr.dataset.categoryId;
        // let account = tr.dataset.account;
        // let account_name = tr.dataset.accountname;
        // let customername = tr.dataset.customername;
        // let itemID = tr.dataset.itemid;
        // console.log(budgetname,category,account_name,customername,itemID)
        
        console.log("actual recort data - ",currentInputArr)

        // Save auto fill button action
        applyBtn.addEventListener('click', function() {
            const methodBtn = autofillMethod.value;
            const amount = autofill_Table_amount.value;
            let finalMonthArrsss = [currentInputArr[0], ...finalMonthArr.map(v => v.toLocaleString())];
            console.log("finalMonthArrsss - ",finalMonthArrsss)
            inputs.forEach((input, idx) => {
                if (finalMonthArrsss[idx] !== undefined) {
                    // input.classList.add('editing')
                    input.value = finalMonthArrsss[idx];
                    let Finaltd = input.closest('td');
                    if (Finaltd) Finaltd.classList.add('editing');
                }
            });
            
            // close popup and remove classes.
            autofillModal.hide();
            // Remove leftover backdrops
            document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            // Reset body classes & styles
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        });

    }
});

// Function to update preview table
function updatePreview() {
    const method = autofillMethod.value;
    const amount = parseFloat(autofill_Table_amount.value) || 0;
    const firstPeriod = parseFloat(firstPeriodAmount.value) || 0;
    const enterPercentage = parseFloat(autofillPercentageInput.value) || 0;
    finalMonthArr.length = 0
    switch(method) {
        case 'fixed':
            autofillPercentageInput.value = null;
            firstPeriodAmount.value = null;
            janValue.textContent = amount;
            febValue.textContent = amount;
            marValue.textContent = amount;
            aprValue.textContent = amount;
            months.forEach(Monthelement => {
                finalMonthArr.push(amount)
            });
            break;
        case 'adjustment':
            autofillPercentageInput.value = null;
            janValue.textContent = firstPeriod;
            febValue.textContent = firstPeriod + amount;
            marValue.textContent = firstPeriod + (amount * 2);
            aprValue.textContent = firstPeriod + (amount * 3);
            months.forEach((_, idx) => {
                finalMonthArr.push(idx === 0 ? firstPeriod : firstPeriod + (amount * idx));
            });
            break;
        case 'fixed-percentage':
            firstPeriodAmount.value = null;
            const fixedPercentageAmt = amount * (enterPercentage / 100);
            janValue.textContent = amount + fixedPercentageAmt;
            febValue.textContent = amount + fixedPercentageAmt;
            marValue.textContent = amount + fixedPercentageAmt;
            aprValue.textContent = amount + fixedPercentageAmt;
            months.forEach((_, idx) => {
                finalMonthArr.push(amount + fixedPercentageAmt);
            });
            break;
        case 'adj-percentage':
            // Apply adjustment percentage to original values
            const fixedPercentageAmts = amount * (enterPercentage / 100);
            janValue.textContent = firstPeriod;
            febValue.textContent = firstPeriod + amount + fixedPercentageAmts;
            marValue.textContent = firstPeriod + (amount + fixedPercentageAmts) * 2 ;
            aprValue.textContent = firstPeriod + (amount + fixedPercentageAmts) * 3 ;
             months.forEach((_, idx) => {
                finalMonthArr.push(idx === 0 ? firstPeriod : firstPeriod + (amount + fixedPercentageAmts) * idx);
            });
            break;
    }
    return finalMonthArr
}

function resetAutofillPop(){
    if(firstPeriodContainer.style.display = 'flex'){
        firstPeriodContainer.style.display = 'none';
    }
    if(autofillpercentageInpuContainer.style.display = 'flex'){
        autofillpercentageInpuContainer.style.display = 'none';
    }
    autofillMethod.value = 'fixed';
    autofillPercentageInput.value = null;
    firstPeriodAmount.value = null;
}
