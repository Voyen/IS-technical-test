import { RemovalPolicy } from 'aws-cdk-lib';
import { ILogGroup, LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { ServerBuild } from './server';

export interface BuildProps {
    logGroup: ILogGroup;
}

export class CI extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);

        const logGroup = new LogGroup(this, 'Logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_DAY,
        });

        new ServerBuild(this, 'Server', { logGroup });
    }
}
