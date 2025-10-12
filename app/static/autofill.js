// Grab modal elements
const autofillModal = document.getElementById('autofillModal');
const closeAutofill = document.getElementById('closeAutofill');
const cancelAutofill = document.getElementById('cancelAutofill');
const applyBtn = document.getElementById('applyAutofill');

const autofillMethod = document.getElementById('autofillMethod');
const firstPeriodContainer = document.getElementById('firstPeriodContainer');
const firstPeriodAmount = document.getElementById('firstPeriodAmount');
const janValue = document.getElementById('janValue');
const febValue = document.getElementById('febValue');
const marValue = document.getElementById('marValue');
const aprValue = document.getElementById('aprValue');
const autofill_Table_accountname = document.getElementById("autofill-accountname");
const autofill_Table_amount = document.getElementById("autofill-amountInput");
const autofillPercentageInput = document.getElementById("autofill-percentageInput");
const autofillpercentageInpuContainer = document.getElementById('autofillpercentageInpuContainer');
let finalMonthArr = [];
let activeRow = null;

// Open modal when <a> clicked
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.autofill-value');
  if (!btn) return;

  e.preventDefault();
  
  autofillModal.style.display = 'flex';
  requestAnimationFrame(() => autofillModal.classList.add('show'));
  document.body.style.overflow = 'hidden';

  // Open Popup Auto Pupluate Data 
  OpenPopupAutoPupluateData(btn);
});

// Autofill popup
function OpenPopupAutoPupluateData(btn){
    if (btn) {

        const td = btn.closest('td');
        const tr = td.closest('tr');
        activeRow = tr; 
        const inputs = tr.querySelectorAll('input');
        resetAutofillPop()

        currentInputArr = [];
        inputs.forEach((input, idx) => {
            currentInputArr.push(input.value);
        });

        const firstMonthval = parseNumber(currentInputArr[1]);
        autofill_Table_accountname.innerHTML = currentInputArr[0];
        autofill_Table_amount.value = firstMonthval;

        updatePreview();

        autofill_Table_amount.addEventListener('input', updatePreview);
        autofillMethod.addEventListener('change', function() {
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
    }
}
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
// Single click handler for apply button
applyBtn.addEventListener('click', function () {
    if (!activeRow) return; 

    const inputs = activeRow.querySelectorAll('input');
    let finalMonthArrsss = [currentInputArr[0], ...finalMonthArr.map(v => v.toLocaleString())];

    inputs.forEach((input, idx) => {
        if (finalMonthArrsss[idx] !== undefined) {
        input.value = finalMonthArrsss[idx];
        const Finaltd = input.closest('td');
        if (Finaltd) Finaltd.classList.add('editing');
        }
    });
    // Add this row in finnal arr to final update.
    let finalArr = [];
    FinalTableArr(finalArr);
    // Enable add icon in that row using focusin
    const AmountInput = document.querySelector('.amount-input');
    handleFocusIn({ target: AmountInput }); 

    // close popup
    closeAutofillModalFn();
});
// Close modal
function closeAutofillModalFn() {
  autofillModal.classList.remove('show');
  setTimeout(() => {
    autofillModal.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}
// Close modal events
closeAutofill.addEventListener('click', closeAutofillModalFn);
cancelAutofill.addEventListener('click', closeAutofillModalFn);
autofillModal.addEventListener('click', (e) => {
  if (e.target === autofillModal) closeAutofillModalFn();
});
