import { BuildSpec, LinuxBuildImage, Project } from 'aws-cdk-lib/aws-codebuild';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import { CodeBuildAction, EcrSourceAction, EcsDeployAction, ManualApprovalAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { IRepository } from 'aws-cdk-lib/aws-ecr';
import { IBaseService } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

interface Props {
    name: string;
    service: IBaseService;
    repo: IRepository;
}

export class Deployment extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const { name, service, repo } = props;

        const sourceOutput = new Artifact();
        const ecrAction = new EcrSourceAction({
            actionName: 'source',
            output: sourceOutput,
            repository: repo,
        });

        const buildProject = new Project(this, `${name}Convert`, {
            environment: { buildImage: LinuxBuildImage.AMAZON_LINUX_2_5 },
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            `cat imageDetail.json | jq "[. | {name: .RepositoryName, imageUri: .ImageURI}]" > imagedefinitions.json`,
                            'cat imagedefinitions.json',
                        ],
                    },
                },
                artifacts: {
                    files: ['imagedefinitions.json'],
                },
            }),
        });

        const convertOutput = new Artifact();
        const convertAction = new CodeBuildAction({
            actionName: 'convert',
            input: sourceOutput,
            outputs: [convertOutput],
            project: buildProject,
        });

        const approvalAction = new ManualApprovalAction({ actionName: 'approval' });

        const deployAction = new EcsDeployAction({
            actionName: 'deploy',
            service,
            input: convertOutput,
        });

        new Pipeline(this, `${name}Deploy`, {
            stages: [
                { stageName: 'Source', actions: [ecrAction] },
                { stageName: 'Convert', actions: [convertAction] },
                { stageName: 'Approval', actions: [approvalAction] },
                { stageName: 'Deploy', actions: [deployAction] },
            ],
        });
    }
}
