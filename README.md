# Overview

Microservice web application running in Azure Functions that provides the processing logic of a passed in "perf spec" and start/end time frame. This service can be used as a software quality gate within continuous integration software pipelines. 

The "perf spec" processing logic uses the [Keptn Pitometer NodeJS modules](https://github.com/keptn/pitometer). This web application uses these specific modules.
* [pitometer](https://github.com/pitometer/pitometer) - Core module that acts as monspec processor to the request
* [source-dynatrace](https://github.com/pitometer/source-dynatrace) - interfaces to Dynatrace API to collect metrics
* [grader-thresholds](https://github.com/pitometer/grader-thresholds) - evaluates the threasholds and scores the request

# Interface design

## Request - Perf Spec evaluation
* POST request to https://[baseurl]/api/pitometer
* Content-Type: application/json
* Body Structure
  * timeStart - start time in [UTC unix seconds format](https://cloud.google.com/dataprep/docs/html/UNIXTIME-Function_57344718) used for the query
  * timeEnd - end time in [UTC unix seconds format](https://cloud.google.com/dataprep/docs/html/UNIXTIME-Function_57344718) used for the query
  * perfSpec - a JSON structure containing the performance signature
    * spec_version - string property with pitometer version.  Use 1.0
    * indicator - array of each indicator objects
    * objectives - object with pass and warning properties
    * <details><summary>Body Structure Format</summary>

        ```
        {
            "timeStart": 1551398400,
            "timeEnd": 1555027200,
            "perfSpec": {
                "spec_version": "1.0",
                "indicators": [ { <Indicator object 1> } ],
                "objectives": {
                    "pass": 100,
                    "warning": 50
                }
            }
        }
        ```

        </details>

    * [Complete Body example](samples/pitometer.rest)


## Response of valid lookup

A valid response will return an HTTP 200 with a JSON body containing these properties:
* totalScore - numeric property with the sum of the passsing indicator metricScores
* objectives - object with pass and warning properties passed in from the request
* indicatorResults - array of each indicator and their specific scores and values
* result - string property with value of 'pass', 'warn' or 'warning'

<details><summary>
Example response message
</summary>

```
{
    "totalScore": 100,
    "objectives": {
        "pass": 100,
        "warning": 50
    },
    "indicatorResults": [
        {
            "id": "P90_ResponseTime_Frontend",
            "violations": [
                {
                    "value": 12773344.5,
                    "key": "SERVICE-CA9FE330E85EE73B",
                    "breach": "upper_critical",
                    "threshold": 4000000
                }]
            ],
            "score": 50
        },
        {
            "id": "AVG_ResponseTime_Frontend",
            "violations": [
                {
                    "value": 4308886.6,
                    "key": "SERVICE-CA9FE330E85EE73B",
                    "breach": "upper_critical",
                    "threshold": 4000000
                }
            ],
            "score": 50
        }
    ],
    "result": "pass"
}
```

</details>

## Example response of invalid arguments

A valid response will return an HTTP 400 with a JSON body containing these properties:
* result - string property with value of 'error'
* message - string property with error messsage

<details><summary>
Example response message
</summary>

```
{
  "status": "error",
  "message": "Missing timeStart. Please check your request body and try again."
}
```
</details>

## Example response of processing error

A valid response will return an HTTP 500 with a JSON body containing these properties:
* result - string property with value of 'error'
* message - string property with error messsage

<details><summary>
Example response message
</summary>

```
{
  "status": "error",
  "message": "The given timeseries id is not configured."
}
```
</details>

# Run the app from Azure Functions

You can run the app inside of Visual Studio Code using VSCODE tools for Azure Functions (option 1): https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions or build everything using Azure CLI, bash/cmd and your favorite node JS IDE tools to code and push to Azure (option 2).

### Option 1 - Running from VSCODE

1. Follow the instructions to create your project and set your VSCODE environment to work with Azure Functions following this tutorial: https://code.visualstudio.com/tutorials/functions-extension/getting-started, You don`t need to create a new Functions project and publish it to Azure, We will do it later, but make sure that your environment is working correctly and the best way is following the tutorial until the end.

2. Clone THIS repository and select (open the folder with VSCODE) (set the folder as the root of your project in VSCODE).

3. Run the following commands to make sure the Functions is working locally:

    * Install the dependencies
        ```
        npm install
        ```
    * Run the project using the Debugger option in VSCODE (Pressing F5) or type in terminal:
        ```
        npm start
        ```
4. The Project should start and you will see in the terminal window the URLs of the functions APIs, use the http://localhost:7071/api/pitometer to send requests, use the pitometer.rest located at the project sample folder to send to your requests (this perfSpec is designed to use with Dynatrace tools if you want to create your own perfSpec file to integrate Prometheus or other telemetry tools feel free to share with us!).

5. Create the environment variables in the Azure Functions App Settings, open the Azure Tab in VSCODE and click on the Function App and click again to download the Appsettings to your machine, this will create a local.settings.json in your project. Update the Appsettings with the following variables (Fill the values of DYNATRACE_BASEURL and DYNATRACE_APITOKEN):

```
DYNATRACE_BASEURL
DYNATRACE_APITOKEN
```

![CONFIGURING APPSETTINGS IN AZURE FUNCTIONS](https://github.com/dt-azure-demo/pitometer-azfunctions/blob/master/resources/localsettings.png)

If you don`t have created yet the Azure Function in Azure yet, you can modify in the local.settings.json locally and Upload the file after you updated it.

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "<YOUR AZURE STORAGE ACCOUNT>",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_EXTENSION_VERSION": "~2",
    "WEBSITE_NODE_DEFAULT_VERSION": "8.11.1",
    "WEBSITE_CONTENTAZUREFILECONNECTIONSTRING": "<YOUR AZURE FILE STORAGE ACCOUNT>",
    "WEBSITE_CONTENTSHARE": "pitfunc-content",
    "WEBSITE_RUN_FROM_PACKAGE": "1",
    "DYNATRACE_APITOKEN": "<YOUR DYNATRACE API TOKEN>",
    "DYNATRACE_BASEURL": "<YOUR DYNATRACE BASE URL>"
  }
}
```

6. make a post request using a tool like [Postman](https://www.getpostman.com/downloads/) or the [VS Code REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and the [Complete Body example](samples/pitometer.rest)

7. Create the service Azure Functions App using the Azure Portal, VSCODE or Azure CLI, choose the best one for you and after creating the service in Azure, deploy it using the VSCODE button ()Deploy to Function App...).

Here are some ways to create the Azure Functions in Azure (this tutorial tested only with Windows Azure Functions v2.0):

Creating the Function using VSCODE: https://docs.microsoft.com/pt-br/azure/azure-functions/functions-create-first-function-vs-code

Create the Azure Functions using Azure Portal: https://docs.microsoft.com/pt-br/azure/azure-functions/functions-create-first-azure-function 

Create the Azure Functions using Azure CLI: https://docs.microsoft.com/pt-br/azure/azure-functions/functions-create-first-azure-function-azure-cli 

### Option 2 - Code and Deploy everything with scripts and code

1. You must have [node](https://nodejs.org/en/download/) installed locally.
2. Once you clone the repo, you need to run ```npm install``` to download the required modules
3. Confugure these environment variables
  * option 1: set environment variables in the shell
    ```
    export DYNATRACE_BASEURL=<dynatrace tenant url, example: https://abc.live.dynatrace.com>

    export DYNATRACE_APITOKEN=<dynatrace API token>
    ```
4. run ```npm start```
5. make post request using a tool like [Postman](https://www.getpostman.com/downloads/) or the [VS Code REST client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and the [Complete Body example](samples/pitometer.rest)
6. Install the Azure Functions tools in your environment, follow the documentation to set up in Windows, Mac or Linux: https://code.visualstudio.com/tutorials/functions-extension/getting-started 
7. Create the Azure Functions using the Azure CLI https://docs.microsoft.com/pt-br/azure/azure-functions/functions-create-first-azure-function-azure-cli follow the documentation to create all the resources needed to deploy Azure Functions and COPY the GIT Address and credentials to push changes to the Functions repository, We will do a new push to this respository using the code from this repository.
8. Clone this repository, set the new origin using the GIT Address you copied in the step before and push it.
9. The Azure Function should restart and you can access using the  address https://[yourfunctionsname.azurewebsites.net]/api/pitometer
