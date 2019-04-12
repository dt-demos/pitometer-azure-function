import { AzureFunction, Context, HttpRequest } from "@azure/functions"

//pitometer modules required
const DynatraceSource = require('@pitometer/source-dynatrace').Source;
const PrometheusSource = require('@pitometer/source-prometheus').Source;
const ThresholdGrader = require('@pitometer/grader-threshold').Grader;
const Pitometer = require ("@pitometer/pitometer").Pitometer;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const monspecfile = (req.query.monspec || (req.body && req.body.monspec));

    var pitometer = new Pitometer();
    

    if (monspecfile) 
    {
        pitometer.addSource('Dynatrace', new DynatraceSource({
            baseUrl: process.env.DYNATRACEURL,
            apiToken: process.env.DYNATRACEKEY,
      
          }));
    
          pitometer.addSource('Prometheus', new PrometheusSource({
            baseUrl: process.env.PROMETHEUSURL,
            apiToken: process.env.PROMETHEUSKEY,
        
          }));

          pitometer.addGrader('Threshold', new ThresholdGrader());
          let telemetryerr:any;
          let telemetryresult:object;
  
        await pitometer.run(monspecfile)
        .then((results) => telemetryresult = results)
        .catch((err) => telemetryerr = err); 

        if(telemetryerr)
            {
                if(telemetryerr.message.includes('failed to resolve tenant'))
                {
                context.res =
                    {
                    status: 500,
                    body:({ status: 'fail', message: telemetryerr.message })
                    };
                }
                else
                {
                context.res =
                    {
                    status: 400,
                    body:({ status: 'fail', message: telemetryerr.message })
                    };
                }
            }
        context.res = 
        {
            status: 200, /* Defaults to 200 */
            body: telemetryresult           
        };
    }
    else 
    {
        context.res = 
        {
            status: 400,
            body: ({status: 'fail', message: 'The Perfspec file is empty or wrong, please check your request body and try again.'})
        };
    }
};

export default httpTrigger;
