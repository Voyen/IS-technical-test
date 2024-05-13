import { RemovalPolicy } from 'aws-cdk-lib';
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { BaseService, Cluster, ContainerImage, FargateService, FargateTaskDefinition, LogDrivers } from 'aws-cdk-lib/aws-ecs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface Props {
    vpc: IVpc;
    serverRepo: IRepository;
    clientRepo: IRepository;
}

export class Services extends Construct {
    server: BaseService;
    client: BaseService;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const { vpc, clientRepo, serverRepo } = props;

        // Cluster
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
        const serverTask = new FargateTaskDefinition(this, 'ServerTask', {
            cpu: 512,
            memoryLimitMiB: 1024,
            family: 'server',
        });
        serverTask.addContainer('server', {
            image: ContainerImage.fromEcrRepository(serverRepo),
            logging: LogDrivers.awsLogs({ streamPrefix: 'server', logGroup: sharedLogsGroup }),
            portMappings: [{ containerPort: 5000 }],
        });
        this.server = new FargateService(this, 'Server', {
            cluster,
            taskDefinition: serverTask,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            desiredCount: 1,
            circuitBreaker: { rollback: true },
            securityGroups: [securityGroup],
        });

        // Client
        const clientTask = new FargateTaskDefinition(this, 'ClientTask', {
            cpu: 512,
            memoryLimitMiB: 1024,
            family: 'client',
        });
        clientTask.addContainer('client', {
            image: ContainerImage.fromEcrRepository(clientRepo),
            logging: LogDrivers.awsLogs({ streamPrefix: 'client', logGroup: sharedLogsGroup }),
            portMappings: [{ containerPort: 3000 }],
        });
        this.client = new FargateService(this, 'Client', {
            cluster,
            taskDefinition: clientTask,
            minHealthyPercent: 100,
            maxHealthyPercent: 200,
            desiredCount: 1,
            circuitBreaker: { rollback: true },
            securityGroups: [securityGroup],
        });
    }
}
