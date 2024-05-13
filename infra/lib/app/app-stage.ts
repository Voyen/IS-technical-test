import { RemovalPolicy, Stack, Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Domain } from './domain';
import { SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, FargateTaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

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

        // Domain
        const { certificate, newHostedZone } = new Domain(this, 'Domain', { ...props, domain });

        // Network
        const vpc = new Vpc(this, 'VPC', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'ingress',
                    subnetType: SubnetType.PUBLIC,
                },
            ],
        });

        // Application
        const cluster = new Cluster(this, 'Ecs', {
            vpc,
            containerInsights: true,
        });
        const securityGroup = new SecurityGroup(this, 'Internal', { vpc });

        // Shared logs
        const sharedLogsGroup = new LogGroup(this, 'AppLogs', {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_MONTH,
        });

        // Backend
        const server = new FargateTaskDefinition(this, 'ServerTask', {
            cpu: 512,
            memoryLimitMiB: 1024,
            family: 'server',
        });
        // const
    }
}
