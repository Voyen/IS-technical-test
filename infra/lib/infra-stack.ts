import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { InfraPipeline } from './infra-pipeline';
import { AppStage } from './app/app-stage';

export class InfraStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const infraPipeline = new InfraPipeline(this, 'Infra', {
            pipelineName: 'MainInfraPipeline',
            connectionArn: '',
            infraRepository: 'IS-technical-test',
        });

        const environment = new AppStage(this, 'Prod', { ...props, domain: 'exercise' });
        infraPipeline.pipeline.addStage(environment);
    }
}
