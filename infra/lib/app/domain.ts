import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HostedZone, IHostedZone, PublicHostedZone, ZoneDelegationRecord } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface DomainProps {
    domain: string;
}

export class Domain extends Construct {
    public readonly hostedZone: IHostedZone;
    public readonly certificate: ICertificate;

    constructor(scope: Construct, id: string, props: DomainProps) {
        super(scope, id);
        const { domain } = props;

        const rootHostedZone = HostedZone.fromHostedZoneAttributes(this, 'RootZone', {
            hostedZoneId: 'Z01355202GXG88DDNYUDL',
            zoneName: 'voyen.io',
        });
        const FQDN = `${domain}.${rootHostedZone.zoneName}`;

        this.hostedZone = new PublicHostedZone(this, 'Zone', {
            zoneName: FQDN,
        });

        new ZoneDelegationRecord(this, 'Delegation', {
            zone: rootHostedZone,
            recordName: this.hostedZone.zoneName,
            nameServers: this.hostedZone.hostedZoneNameServers!,
        });

        this.certificate = new Certificate(this, 'Certificate', {
            domainName: FQDN,
            validation: CertificateValidation.fromDns(this.hostedZone),
        });
    }
}
