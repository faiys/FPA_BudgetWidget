const AppName = "fpa";
const AllFetchArr = [];
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
fetch("Budget_Manager_Items_Js", "",AllFetchArr)