import { Stack, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Domain } from './domain';

export interface AppProps extends StageProps {
    domain: string;
}

export class AppStage extends Stage {
    constructor(scope: Construct, id: string, props: AppProps) {
        super(scope, id, props);
        new Application(this, 'Stage', props);
    }
}

class Application extends Stack {
    constructor(scope: Construct, id: string, props: AppProps) {
        super(scope, id, props);

        const { domain } = props;

        const { certificate, newHostedZone } = new Domain(this, 'Domain', { ...props, domain });
    }
}
