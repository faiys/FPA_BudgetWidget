const AppName = "fpa";
AllFetchArr = [];

const error_msg = document.getElementById("error-msdid");

// Onload run fetch data
document.addEventListener("DOMContentLoaded", () => {
//  RenderBudgetTable("Budget_Manager_Items_Js", "",AllFetchArr)
 AddBudget('PnL_Raw_Report', '', AllFetchArr=[])
});

// Fetch Records
async function fetch(ReportName, recordCursor, AllFetchArr){
    try{
        
        let criteriaVar = "";
        if(ReportName === "COA_Report"){
            criteriaVar = "(Class.Class != \"EQUITY\" && Class.Class != \"LIABILITY\" && Class.Class != \"ASSET\" && Status == \"ACTIVE\")"
        }
        else if(ReportName === "PnL_Raw_Report"){
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
                    console.log(Arr_merged)
                    return Arr_merged;
                    // if(ReportName === "Budget_Manager_Items_Js"){
                    //     console.log(Arr_merged)
                        
                    // }
                    // else if(ReportName === "COA_Report"){
                    //     AddBudget(AllFetchArr)
                    // }
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
                fetch("Budget_Manager_Items_Js", "",AllFetchArr)

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
            fetch("Budget_Manager_Items_Js", "",AllFetchArr)

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
function POSTRecord(FormName, customer_Arr){
    console.log("customerArr - ",customer_Arr)
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
        var postRec_config = {
            app_name: AppName,
            form_name: FormName,
            payload: payload
        };
        ZOHO.CREATOR.DATA.addRecords(postRec_config).then(function () {
            if (post_response.code == 3000) {
                let AllFetchArr = [];
                fetch("Budget_Manager_Items_Js", "",AllFetchArr)
                
                // Submit Response
                errorMsg("Item Added.", "green")
            }
            else{
                console.log("POST rec error = ",post_response)
            }
        });       
    }
    catch (err){
         console.log("zoho init error for update = ", err)
    }
}