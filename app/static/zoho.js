const AppName = "fpa";
AllFetchArr = [];

const error_msg = document.getElementById("error-msdid");

document.addEventListener("DOMContentLoaded", async () => {
    try{

        const userList = await getUserDetail("All_Users_Js", "", [])
        
        if(userList != null){
            const orgId = userList[0];
            showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults="budgetItems", orgId))
        }
    }
    catch(err){
        console.error("Error loading P&L data:", err);
    }
});

// Fetch Records
async function fetch(ReportName, recordCursor, AllFetchArr, orgId){
    let Arr_merged =[];
    try{
        let criteriaVar = "";
        if(ReportName === "Budget_Manager_Items_Js" && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
            
            criteriaVar = "(Budget_Manager != null && Organisation == "+`${orgId}`+")"
        }
        else if(ReportName === "COA_Report" && AllFetchArr.length  === 0 && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
            criteriaVar = "(Class.Class != \"EQUITY\" && Class.Class != \"LIABILITY\" && Class.Class != \"ASSET\" && Status == \"ACTIVE\")"
        }
        else if(ReportName === "Budget_Manager_Items_Js" && AllFetchArr.length  > 0  && recordCursor === "prefilbudget" || recordCursor === "Assumption_budget"){
            criteriaVar = "(Budget_Manager == "+AllFetchArr[0]+"&& Organisation == "+`${orgId}`+")"
            recordCursor = "";
            AllFetchArr = [];
        }
        else if(ReportName === "All_Users_Js"){
           const loginEmail = await getLoginUserID(); 
           criteriaVar = `Status == "Active" && Email == "${loginEmail}"`;
        }
        else if(ReportName === "Pnl_With_Margin_Raw_JS" && orgId){
           criteriaVar = `Organisation_Lookup == ${orgId}`;
        }
        else if(ReportName === "All_Budget_Managers_Js" && orgId){
           criteriaVar = `Organisation == ${orgId}`;
        }
         var config = {
            app_name: AppName,
            report_name: ReportName,
            criteria: criteriaVar,
            record_cursor : recordCursor,
            max_records : 1000
        };
        const fetchResp = await ZOHO.CREATOR.DATA.getRecords(config);
        if(fetchResp){
            if(fetchResp.code == 3000){
                var MainData =  fetchResp.data;
                // push arr for get another set of records, if data available.
                AllFetchArr.push(MainData)
                if(fetchResp.record_cursor){
                    // Get the next batch record from zoho report
                    return await fetch(ReportName, fetchResp.record_cursor, AllFetchArr);
                }
                else{
                    Arr_merged = AllFetchArr.flat();
                    // get only items arr for pagination
                    // const budgetItems = Arr_merged.flatMap(obj => obj.Budget_Items);
                    if(ReportName === "Budget_Manager_Items_Js" && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
                        ArrayStorage(Arr_merged)
                    }
                    return Arr_merged;
                }
            }
            else{
                if(ReportName === "Budget_Manager_Items_Js" && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
                    ArrayStorage(Arr_merged)
                }
                console.log("No Record found - ",fetchResp)
                return Arr_merged;
            }
        }
        else{
            if(ReportName === "Budget_Manager_Items_Js" && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
                ArrayStorage(Arr_merged)
            }
            console.log("Fetch API Error")
            return Arr_merged;
        }
    }
    catch (err)
    {
        if(ReportName === "Budget_Manager_Items_Js" && recordCursor != "prefilbudget" && recordCursor != "Assumption_budget"){
            ArrayStorage(Arr_merged)
        }
        console.log("zoho init error = ", err)
        return Arr_merged;
    }
}

// Update API
function UpdateRecordByID(ReportName,RecID, customer_Arr, orgId){
    let payload = "";
    try{
        if(ReportName === "Budget_Manager_Items_Js" && customer_Arr){
            payload = {
                "data":
                {
                    "Customer" : customer_Arr.Customer,
                    "January" : customer_Arr.January,
                    "February" : customer_Arr.February,
                    "March" : customer_Arr.March,
                    "April" : customer_Arr.April,
                    "May" : customer_Arr.May,
                    "June" : customer_Arr.June,
                    "July" : customer_Arr.July,
                    "August" : customer_Arr.August,
                    "September" : customer_Arr.September,
                    "October" : customer_Arr.October,
                    "November" : customer_Arr.November,
                    "December" : customer_Arr.December,
                    UpdateRecordsJs : true,
                    Organisation : orgId
                }
            }
        }
        var UpdateRec_config = {
                app_name: AppName,
                report_name: ReportName,
                id: RecID,
                payload: payload
            };
        ZOHO.CREATOR.DATA.updateRecordById(UpdateRec_config).then(function (Update_response) {
            if (Update_response.code == 3000) {
               
                let AllFetchArr = [];
                showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "", AllFetchArr, defaults="budgetItems", orgId));
                
                // Submit Response
                errorMsg("Item Updated.", "green")

            } 
            else{
                console.log("Update rec error = ",Update_response)
            }
        });
        
    }
    catch (err){
         console.log("zoho init error for update = ", err)
    }

}

// Delete ApI
function DeleteRecordByID(ReportName, RecID, orgId){
    try{
        var Deleteconfig = {
            app_name: AppName,
            report_name: ReportName,
            id: RecID
        };
        ZOHO.CREATOR.DATA.deleteRecordById(Deleteconfig).then(function (Delete_response) {
        if (Delete_response.code == 3000) {
            let AllFetchArr = [];
            showLoaderWhile(RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults="budgetItems", orgId))

            // Submit Response
            setTimeout(() => {
                errorMsg("Item Deleted.", "green")
            }, 3000);
        }
        else{
                console.log("Deleted rec error = ",Delete_response)
            }
        });
    }
    catch (err){
        console.log("zoho init error for update = ", err)
    }
}

// Post API
async function POSTRecord(FormName, customer_Arr, orgId){
    let payload = "";
    try{
        if(FormName === "Budget_Manager_Items" && customer_Arr){
            payload = {
                "data":
                {
                    "Customer" : customer_Arr.Customer,
                    "Class" : customer_Arr.categoryID,
                    "Account_Name" :customer_Arr.account,
                    "Budget_Manager" :customer_Arr.budgetId,
                    "Year_field" : customer_Arr.year,
                    "January" : customer_Arr.January,
                    "February" : customer_Arr.February,
                    "March" : customer_Arr.March,
                    "April" : customer_Arr.April,
                    "May" : customer_Arr.May,
                    "June" : customer_Arr.June,
                    "July" : customer_Arr.July,
                    "August" : customer_Arr.August,
                    "September" : customer_Arr.September,
                    "October" : customer_Arr.October,
                    "November" : customer_Arr.November,
                    "December" : customer_Arr.December,
                     "UpdateRecordsJs" : true,
                     "Organisation" : orgId
                }
            }
        }
        else if(FormName === "Budget_Manager" && customer_Arr){
            payload = {
                "data":
                {
                    "Name" : customer_Arr.name,
                    "Year_field" : customer_Arr.year,
                    "Start_Month" :customer_Arr.month,
                    "Period" : customer_Arr.period,
                    "UpdateRecordsJs" : true,
                    "Organisation" : orgId
                }
            }
        }
        // else if(FormName === "Pnl_Schedule"){
        //     payload = {
        //         "data":
        //         {
        //             "Name" : "JSBudgetUpdateAnalytics",
        //             "Start_Time" :getCurrentDateTimeDDMMYYYY(0,10)
        //         }
        //     }
        // }
        var postRec_config = {
            app_name: AppName,
            form_name: FormName,
            payload: payload
        };
        const post_response = await ZOHO.CREATOR.DATA.addRecords(postRec_config);
        if (post_response.code == 3000) {
            // Call budget sycn to analytics
            // if(FormName === "Budget_Manager_Items"){
            //     POSTRecord("Pnl_Schedule", []);
            // }
            return post_response
        }
        else{
            console.log("POST rec error = ",post_response)
            return post_response
        }    
    }
    catch (err){
         console.log("zoho init error for update = ", err)
         return err
    }
}

// Post Bulk API
async function POSTBulkRecord(FormName, inputArr){
     let payload = "";
    try{
        if(FormName === "Budget_Manager_Items" && inputArr){
            payload = {
                "data": inputArr
            }
        }
        var postRec_config = {
            app_name: AppName,
            form_name: FormName,
            private_link : "v880yEkuP3seQCT7fOhvJgG0WgdY29hFudt5yAKw9YarRE6wYXGBVw21jCmxgAyRMV4KT5nuMsW5EYZ1tU81sCA3wx8vPkh402bA",
            payload: payload
        };
        const post_response = await ZOHO.CREATOR.PUBLISH.addRecords(postRec_config);
        if (post_response.code == 3000) {
            // if(FormName === "Budget_Manager_Items"){
            //     POSTRecord("Pnl_Schedule", []);
            // }
            return post_response
        }
        else{
            console.log("POST Bulk rec error = ",post_response)
            return post_response
        }    
    }
    catch (err){
         console.log("zoho init error for update = ", err)
         return err
    }
}

 // Store array for searching and resue lookup
function ArrayStorage(inputArr){
    const budgetItemsData_cached = localStorage.getItem('budgetItemsData');
    if (budgetItemsData_cached) {
        localStorage.removeItem('budgetItemsData');
    }
    localStorage.setItem('budgetItemsData', JSON.stringify(inputArr));
}

//Get Login Email ID
async function getLoginUserID() {
    try{
        const getParamResp = await ZOHO.CREATOR.UTIL.getInitParams();
        if(getParamResp){
            return getParamResp.loginUser;
        }
    }
    catch (err){
        console.log("Get User - ", err)
        return null
    }
}

// Get User and Organization
async function getUserDetail(ReportName, recordCursor, AllFetchArr){
    try{
        userResp = await fetch(ReportName, recordCursor, AllFetchArr);
        if(userResp){
            return [userResp[0]["Organisation"]["ID"], userResp[0]["Name"], userResp[0]["Budget_limitations"]];
        }
        
    }
    catch (err){
        console.error("Error user login data:", err);
        return null;
    }
}

// Budget limitations
async function budgetLimit(){
    try{
        const userLi = await getUserDetail("All_Users_Js", "", [])
        if(userLi != null){
            const budgetLimits = userLi[2];
            const budgetCntResp = await fetch("All_Budget_Managers_Js", "", [], userLi[0]);
            if(budgetCntResp){
                const budgetCnt = budgetCntResp.length;
                if(budgetLimits <= budgetCnt){
                    console.log(budgetLimits , budgetCnt)
                    return `You’ve hit the maximum of ${budgetCnt} budgets.`
                }
                return null
            }
            return null
        } 
        return null
    }
    catch (err){
        console.error("Error in budget limit:", err);
        return null;
    }
}