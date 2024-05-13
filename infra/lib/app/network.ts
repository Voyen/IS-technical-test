import { IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class Network extends Construct {
    readonly vpc: IVpc;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.vpc = new Vpc(this, 'VPC', {
            maxAzs: 2,
            natGateways: 1,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'ingress',
                    subnetType: SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'app',
                    subnetType: SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        });
    }
}
