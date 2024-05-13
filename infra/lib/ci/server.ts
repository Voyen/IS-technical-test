import { RemovalPolicy } from 'aws-cdk-lib';
import { BuildSpec, EventAction, FilterGroup, LinuxBuildImage, Project, Source } from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';
import { BuildProps } from './ci';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class ServerBuild extends Construct {
    constructor(scope: Construct, id: string, props: BuildProps) {
        super(scope, id);
        const { logGroup } = props;

        const repo = new Repository(this, 'Repo', {
            repositoryName: 'server',
            imageScanOnPush: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        const source = Source.gitHub({
            owner: 'Voyen',
            repo: 'IS-technical-test',
            webhookFilters: [FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main').andFilePathIs('^server/.*')],
        });

        const buildSpec = {
            version: '0.2',
            phases: {
                pre_build: {
                    commands: [
                        'env',
                        'aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin $ECR_REPO_URI',
                    ],
                },
                build: {
                    commands: ['docker build -t $ECR_REPO_URI:$CODEBUILD_RESOLVED_SOURCE_VERSION -t $ECR_REPO_URI:latest .'],
                    finally: [
                        'printf \'[{"name":"app","imageUri":"%s"}]\' $ECR_REPO_URI:$TAG > imagedefinitions.json',
                        'cat imagedefinitions.json',
                    ],
                },
                post_build: {
                    commands: ['docker push $ECR_REPO_URI:$TAG', 'docker push $ECR_REPO_URI:latest'],
                },
            },
            artifacts: {
                files: ['imagedefinitions.json'],
            },
        };

        const buildProject = new Project(this, 'Build', {
            projectName: 'server',
            source,
            environment: {
                buildImage: LinuxBuildImage.STANDARD_7_0,
                privileged: true,
                environmentVariables: {
                    ECR_REPO_URI: { value: repo.repositoryUri },
                },
            },
            buildSpec: BuildSpec.fromObject(buildSpec),
            logging: { cloudWatch: { logGroup } },
        });

        if (buildProject.role) {
            buildProject.role.addToPrincipalPolicy(
                new PolicyStatement({
                    actions: ['ecr:*'],
                    resources: ['*'],
                }),
            );
            buildProject.role.addToPrincipalPolicy(
                new PolicyStatement({
                    actions: ['codebuild:StartBuild'],
                    resources: ['*'],
                }),
            );
        }
    }
}
