import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as path from 'path'
import { Construct } from 'constructs'

// Lambda bundles are produced by `cd ../lambda && npm run build` (via infra predeploy).
// Each bundle is a single CJS file at lambda/dist/<name>/index.js.
const lambdaDist = path.resolve(__dirname, '../../lambda/dist')

export class MyGuideStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ─── DynamoDB (import pre-existing tables) ───────────────────────────────
    // Tables were created manually before CDK was introduced. Importing them
    // lets CDK manage IAM grants without CloudFormation trying to re-create them.

    const cityStopsTable = dynamodb.Table.fromTableName(
      this, 'CityStopsTable', 'cityStops'
    )

    const feedbackTable = dynamodb.Table.fromTableName(
      this, 'FeedbackTable', 'myguide-feedback'
    )

    // ─── Secrets (must exist in Secrets Manager before first deploy) ──────────

    const googlePlacesSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'GooglePlacesSecret', 'myGuide/googlePlacesApiKey'
    )

    // OpenTripMap key — fetched at Lambda cold-start; secret name passed as env var
    const otmSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'OtmSecret', 'myGuide/openTripMapApiKey'
    )

    // Store Mollie API key in Secrets Manager as myGuide/mollieApiKey
    const mollieSecret = secretsmanager.Secret.fromSecretNameV2(
      this, 'MollieSecret', 'myGuide/mollieApiKey'
    )

    // ─── Lambda functions ─────────────────────────────────────────────────────

    const nodeRuntime = lambda.Runtime.NODEJS_22_X

    // createCityStop — queries Google Places API, writes stops to DynamoDB.
    // aws-sdk v2 is bundled inline (not in Node 22 runtime); esbuild tree-shakes it.
    const createCityStopFn = new lambda.Function(this, 'CreateCityStopFn', {
      functionName: 'myguide-createCityStop',
      runtime:      nodeRuntime,
      handler:      'index.handler',
      code:         lambda.Code.fromAsset(path.join(lambdaDist, 'createCityStop')),
      timeout:      cdk.Duration.seconds(30),
      memorySize:   256,
    })

    googlePlacesSecret.grantRead(createCityStopFn)
    cityStopsTable.grantReadWriteData(createCityStopFn)

    // feedback — POST stores feedback; GET returns approved testimonials via GSI1.
    const feedbackFn = new lambda.Function(this, 'FeedbackFn', {
      functionName: 'myguide-feedback',
      runtime:      nodeRuntime,
      handler:      'index.handler',
      code:         lambda.Code.fromAsset(path.join(lambdaDist, 'feedback')),
      timeout:      cdk.Duration.seconds(10),
      memorySize:   128,
      environment: {
        DYNAMODB_TABLE: feedbackTable.tableName,
      },
    })

    feedbackTable.grantReadWriteData(feedbackFn)

    // payments — creates a Mollie checkout URL.
    // MOLLIE_API_KEY: Lambda reads process.env.MOLLIE_API_KEY at startup.
    // Lambda env vars cannot directly embed Secrets Manager values at deploy time.
    // Options once ready:
    //   A) Update the Lambda to fetch the secret from Secrets Manager at cold-start
    //   B) Store the key in SSM Parameter Store (String) and reference it via
    //      ssm.StringParameter.valueForStringParameter()
    // The Lambda already has grantRead access to mollieSecret below.
    const paymentsFn = new lambda.Function(this, 'PaymentsFn', {
      functionName: 'myguide-payments',
      runtime:      nodeRuntime,
      handler:      'index.handler',
      code:         lambda.Code.fromAsset(path.join(lambdaDist, 'payments')),
      timeout:      cdk.Duration.seconds(15),
      memorySize:   128,
    })

    mollieSecret.grantRead(paymentsFn)

    // stopEnrichment — fetches OpenTripMap data and writes it back to the stop record.
    const stopEnrichmentFn = new lambda.Function(this, 'StopEnrichmentFn', {
      functionName: 'myguide-stopEnrichment',
      runtime:      nodeRuntime,
      handler:      'index.handler',
      code:         lambda.Code.fromAsset(path.join(lambdaDist, 'stopEnrichment')),
      timeout:      cdk.Duration.seconds(15),
      memorySize:   128,
      environment: {
        STOPS_TABLE:          cityStopsTable.tableName,
        STOPS_TABLE_KEY:      'stopID',
        STOPS_TABLE_SORT_KEY: 'stopCity',
        OTM_SECRET_NAME:      'myGuide/openTripMapApiKey',
      },
    })

    cityStopsTable.grantReadWriteData(stopEnrichmentFn)
    otmSecret.grantRead(stopEnrichmentFn)

    // ─── API Gateway ──────────────────────────────────────────────────────────

    const corsOptions: apigateway.CorsOptions = {
      allowOrigins: [
        'https://citycast.nl',
        'https://www.citycast.nl',
        'http://localhost:5173',
      ],
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
    }

    const api = new apigateway.RestApi(this, 'MyGuideApi', {
      restApiName: 'myguide-api',
      description: 'myGuide cityCast API Gateway',
      deployOptions: {
        stageName:            'production',
        throttlingRateLimit:  50,
        throttlingBurstLimit: 100,
      },
      defaultCorsPreflightOptions: corsOptions,
    })

    // POST /cityStops
    api.root.addResource('cityStops')
      .addMethod('POST', new apigateway.LambdaIntegration(createCityStopFn))

    // GET|POST /feedback
    const feedbackResource = api.root.addResource('feedback')
    feedbackResource.addMethod('GET',  new apigateway.LambdaIntegration(feedbackFn))
    feedbackResource.addMethod('POST', new apigateway.LambdaIntegration(feedbackFn))

    // POST /payment
    api.root.addResource('payment')
      .addMethod('POST', new apigateway.LambdaIntegration(paymentsFn))

    // GET /stopEnrichment
    api.root.addResource('stopEnrichment')
      .addMethod('GET', new apigateway.LambdaIntegration(stopEnrichmentFn))

    // ─── Outputs ─────────────────────────────────────────────────────────────

    new cdk.CfnOutput(this, 'ApiUrl', {
      value:       api.url,
      description: 'myGuide API Gateway base URL — set as VITE_API_BASE_URL in .env.production',
      exportName:  'myguide-api-url',
    })

    new cdk.CfnOutput(this, 'CityStopsTableName', { value: cityStopsTable.tableName })
    new cdk.CfnOutput(this, 'FeedbackTableName',  { value: feedbackTable.tableName })
  }
}
