const AppName = "fpa";
AllFetchArr = [];

const error_msg = document.getElementById("error-msdid");

// Onload run fetch data
document.addEventListener("DOMContentLoaded", () => {
 RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults=true)
//  AddBudget('PnL_Raw_Report_JS', '', AllFetchArr=[])
});

// Fetch Records
async function fetch(ReportName, recordCursor, AllFetchArr){
    try{
        let criteriaVar = "";
        if(ReportName === "COA_Report" && AllFetchArr.length  === 0){
            criteriaVar = "(Class.Class != \"EQUITY\" && Class.Class != \"LIABILITY\" && Class.Class != \"ASSET\" && Status == \"ACTIVE\")"
        }
         var config = {
            app_name: AppName,
            report_name: ReportName,
            criteria: criteriaVar,
            record_cursor : recordCursor
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
                    let Arr_merged = AllFetchArr.flat();
                    return Arr_merged;
                }
            }
            else{
                console.log("No Record found - ",fetchResp)
            }
        }
        else{
            console.log("Fetch API Error")
        }
    }
    catch (err)
    {
        console.log("zoho init error = ", err)
    }
}

// Update API
function UpdateRecordByID(ReportName,RecID, customer_Arr){
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
                    "December" : customer_Arr.December
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
                RenderBudgetTable("Budget_Manager_Items_Js", "", AllFetchArr, defaults=true);
                
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
function DeleteRecordByID(ReportName, RecID){
    try{
        var Deleteconfig = {
            app_name: AppName,
            report_name: ReportName,
            id: RecID
        };
        ZOHO.CREATOR.DATA.deleteRecordById(Deleteconfig).then(function (Delete_response) {
        if (Delete_response.code == 3000) {
            let AllFetchArr = [];
            RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr, defaults=true)

            // Submit Response
            errorMsg("Item Deleted.", "green")
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
async function POSTRecord(FormName, customer_Arr){
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
                    "December" : customer_Arr.December
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
                    "Period" : customer_Arr.period
                }
            }
        }
        var postRec_config = {
            app_name: AppName,
            form_name: FormName,
            payload: payload
        };
        const post_response = await ZOHO.CREATOR.DATA.addRecords(postRec_config);
        if (post_response.code == 3000) {
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
    console.log("inputArr - ",inputArr)
     let payload = "";
    try{
        if(FormName === "Budget_Manager_Items" && inputArr){
            payload = {
                "data": [inputArr]
            }
        }
        console.log("payload = ",payload)
        var postRec_config = {
            app_name: AppName,
            form_name: FormName,
            private_link : "v880yEkuP3seQCT7fOhvJgG0WgdY29hFudt5yAKw9YarRE6wYXGBVw21jCmxgAyRMV4KT5nuMsW5EYZ1tU81sCA3wx8vPkh402bA",
            payload: payload
        };
        const post_response = await ZOHO.CREATOR.PUBLISH.addRecords(postRec_config);
        console.log("post_response = ",post_response)
        if (post_response.code == 3000) {
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