import { Stack, Stage, StageProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import { Deployment } from './deployment';
import { Domain } from './domain';
import { LoadBalancer } from './load-balancer';
import { Network } from './network';
import { Services } from './services';

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

        // Domain
        const { certificate, hostedZone } = new Domain(this, 'Domain', { ...props, domain: props.domain });

        // Network
        const { vpc } = new Network(this, 'Network');

        // Application
        const clientRepo = Repository.fromRepositoryName(this, 'ClientRepo', 'client');
        const serverRepo = Repository.fromRepositoryName(this, 'ServerRepo', 'server');
        const { server, client } = new Services(this, 'Services', { vpc, clientRepo, serverRepo });

        // Load Balancer
        new LoadBalancer(this, 'LB', { vpc, hostedZone, certificate, client, server });

        // Deployments
        new Deployment(this, 'ClientDeploy', { name: 'client', repo: clientRepo, service: client });
        new Deployment(this, 'ServerDeploy', { name: 'server', repo: serverRepo, service: server });
    }
}
