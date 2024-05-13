#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import 'source-map-support/register';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
const env = {
    account: '646548289682',
    region: 'ap-southeast-2',
};

new InfraStack(app, 'InfraStack', { env });
