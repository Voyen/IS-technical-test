import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InfraPipeline } from './infra-pipeline';
import { AppStage } from './app/app-stage';
import { CI } from './ci/ci';

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const infraPipeline = new InfraPipeline(this, 'Infra', {
            pipelineName: 'MainInfraPipeline',
            connectionArn: 'arn:aws:codestar-connections:ap-southeast-2:646548289682:connection/63813c08-c1dd-4bcb-a9cc-ce68eb4c492d',
            infraRepository: 'IS-technical-test',
        });

        new CI(this, 'CI');

        const environment = new AppStage(this, 'Prod', { ...props, domain: 'exercise' });
        infraPipeline.pipeline.addStage(environment);
    }
}
