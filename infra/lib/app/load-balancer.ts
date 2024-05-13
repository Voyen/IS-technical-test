import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IVpc, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { BaseService } from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { LoadBalancerTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface Props {
    vpc: IVpc;
    hostedZone: IHostedZone;
    certificate: ICertificate;
    client: BaseService;
    server: BaseService;
}

export class LoadBalancer extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const { certificate, client, hostedZone, server, vpc } = props;

        const securityGroup = new SecurityGroup(this, 'AlbSG', { vpc });
        const alb = new ApplicationLoadBalancer(this, 'ALB', {
            vpc,
            securityGroup,
            internetFacing: true,
            dropInvalidHeaderFields: true,
            // TODO: Remove this
            deletionProtection: false,
            vpcSubnets: { subnetType: SubnetType.PUBLIC },
        });

        new ARecord(this, 'WebRecord', {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new LoadBalancerTarget(alb)),
        });

        const accessLogBucket = new Bucket(this, 'AccessLogs', {
            autoDeleteObjects: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        alb.logAccessLogs(accessLogBucket);

        const webListener = alb.addListener('https', { port: 443, certificates: [certificate] });
        alb.addRedirect({});

        webListener.addTargets('WebTargets', {
            port: 80,
            targets: [client],
            deregistrationDelay: Duration.seconds(15),
        });
        webListener.addTargets('ServerTargets', {
            port: 80,
            targets: [server],
            deregistrationDelay: Duration.seconds(30),
            priority: 1,
            healthCheck: { path: '/health-check' },
            conditions: [ListenerCondition.pathPatterns(['/api/*'])],
        });
    }
}
