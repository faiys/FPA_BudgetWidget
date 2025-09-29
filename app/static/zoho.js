const AppName = "fpa";
const AllFetchArr = [];

const error_msg = document.getElementById("error-msdid");

// Onload run fetch data
document.addEventListener("DOMContentLoaded", () => {
 fetch("Budget_Manager_Items_Js", "",AllFetchArr)
});

// Fetch Records
async function fetch(ReportName, recordCursor, AllFetchArr){
    try{
        
        let criteriaVar = "";
         var config = {
            app_name: AppName,
            report_name: ReportName,
            criteria: criteriaVar,
            record_cursor : recordCursor
        };
        await ZOHO.CREATOR.DATA.getRecords(config).then(function (fetchResp) {
            // console.log(fetchResp)
            if(fetchResp){
                if(fetchResp.code == 3000){
                    var MainData =  fetchResp.data;
                    // push arr for get another set of records, if data available.
                    AllFetchArr.push(MainData)
                    if(fetchResp.record_cursor){
                        // Get the next batch record from zoho report
                        fetch("Budget_Manager_Items_Js", fetchResp.record_cursor, AllFetchArr)
                    }
                    else{
                        let Arr_merged = AllFetchArr.flat();
                        RenderBudgetTable(Arr_merged);
                    }
                }
                else{
                    console.log("No Record found - ",fetchResp)
                }
            }
            else{
                console.log("Fetch API Error")
            }
        });
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