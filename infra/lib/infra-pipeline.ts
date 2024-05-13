import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

interface InfraPipelineProps {
    pipelineName: string;
    infraRepository: string;
    connectionArn: string;
}

export class InfraPipeline extends Construct {
    public readonly pipeline: CodePipeline;

    constructor(scope: Construct, id: string, props: InfraPipelineProps) {
        super(scope, id);
        const { connectionArn, infraRepository, pipelineName } = props;

        this.pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.connection(`Voyen/${infraRepository}`, 'main', { connectionArn }),
                commands: ['env', 'cd infra', 'n stable', 'npm ci', 'npm run build', 'npx cdk synth'],
                primaryOutputDirectory: 'infra/cdk.out',
            }),
            useChangeSets: false,
        });
    }
}
