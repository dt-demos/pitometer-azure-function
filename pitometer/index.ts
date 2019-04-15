import { AzureFunction, Context, HttpRequest } from "@azure/functions"
//pitometer modules required
const DynatraceSource = require('@pitometer/source-dynatrace').Source;
const ThresholdGrader = require('@pitometer/grader-threshold').Grader;
const Pitometer = require ("@pitometer/pitometer").Pitometer;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const perfSpec =  req.body.perfSpec;
    const timeStart = req.body.timeStart;
    const timeEnd = req.body.timeEnd;

     var pitometer = new Pitometer();

     if(!perfSpec)
    {
        context.res = {
            status: 400,
            body: ({ status: 'error', message: 'Missing perfSpec. Please check your request body and try again.' })
        };
    }

    if(!timeStart)
    {
        context.res = {
            status: 400,
            body: ({ status: 'error', message: 'Missing timeStart. Please check your request body and try again.' })
        };
    }
    if(!timeEnd)
    {
        context.res = {
            status: 400,
            body: ({ status: 'error', message: 'Missing timeEnd. Please check your request body and try again.' })
        };
    }

    pitometer.addSource('Dynatrace', new DynatraceSource({
    baseUrl: process.env.DYNATRACE_BASEURL,
    apiToken: process.env.DYNATRACE_APITOKEN,
      
    }));

    pitometer.addGrader('Threshold', new ThresholdGrader());
    let telemetryErr:any;
    let telemetryResult:any;

    // debug output
    var perfSpecString = JSON.stringify(perfSpec);
    context.log("Passed in timeStart: " + timeStart + "  timeEnd: " + timeEnd)
    context.log("Passed in perfSpecString: " + perfSpecString)

    await pitometer.run(perfSpec, {timeStart: timeStart, timeEnd: timeEnd})
    .then((results) => telemetryResult = results)
    .catch((err) => telemetryErr = err); 

    if (telemetryErr) 
    {
        context.log("Result: " + telemetryErr.message);
        context.res = { 
            status: 500,       
            body:  ({status: 'error', message: telemetryErr.message})
        };
    }
    else {
        context.log("Result: " + JSON.stringify(telemetryResult.result));
        context.res = {        
            body:  ({telemetryResult})
        };
    }
};

export default httpTrigger;
