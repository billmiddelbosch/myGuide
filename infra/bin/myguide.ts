#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { MyGuideStack } from '../lib/myguide-stack'

const app = new cdk.App()

new MyGuideStack(app, 'MyGuideStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'eu-west-2',
  },
  description: 'myGuide — API Gateway + Lambda + DynamoDB for the cityCast app',
})
