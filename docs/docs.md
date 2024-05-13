# Solution Documentation

## Overall Project

The project consists of 2 main parts:

-   Server (written in Python using Flask)
-   Client (written in TypeScript using React with Next.js)

The solution is orchestrated locally using Docker Compose with an Nginx container used as a reverse proxy to avoid requiring CORS workarounds.

When cloning the solution for the first time, build the project with

```sh
make build
```

To run/stop the entire solution just run

```sh
make run # 'run' is optional, it's the default action
make stop
```

Due to proxy configurations, the web client can be accessed at `http://localhost` (without a port).

### Hot Reloadable

Both the Server and Client apps are hot-reloadable in the development environment.
While the solution is running, any changes made to the source code of the respective services will automatically refresh in the containers and will not require rebuilds or restarts.

Exception to this is when introducing new dependencies to either pip or npm. When new libraries are added to either service, you will need to rebuild the containers with

```sh
make stop build run
```

## Backend

Simple Python Flask app that keeps track of a counter in-memory, initialised to 1000.

When the `/decrement` endpoint is hit, this counter will be reduced by 1, and the new counter will be returned.

Requests to the `/counter` endpoint returns the current counter value.

A PUT request to `/reset` will reset the counter back to 1000.

## Frontend

Fairly simple Next.js (App Router) application using the Material UI component library.

The app consists of a single Card component centered on the page containing the current counter value, along with a button to decrement this counter when a camera is sold.

In addition, a 'Settings' button is added to the card with a 'Reset' option which resets the counter back to 1000.

## Cloud

The solution is hosted on AWS, orchestrated with CDK/CloudFormation.
It is live and can be accessed at https://exercise.voyen.io.

The solution uses the following services:

-   Networking
    -   Route53
    -   Certificate Manager
    -   VPC
-   Application
    -   ECS (Elastic Container Service)
    -   ECR (Elastic Container Repository)
    -   Application Load Balancer
    -   S3 (for logging)
-   CI/CD
    -   CodePipeline
    -   CodeBuild

Due to the simplicity of the exercise, this solution was not developed to be fully 'production ready', so some obvious best practices were intentionally not implemented due to time constraints and not wanting to over-engineer the solution simply for the sake of it.

### CI/CD

The deployment pipeline consists of 2 parts; builds and deployments.

The build portion is implemented at the top level using the `CI` construct. This construct creates an ECR Repository, and a CodeBuild Project connected to the GitHub repository for each service.
When a change is detected in either service's directory, the appropriate CodeBuild Project will automatically start with a webhook, build the project, containerise it, then push the new image to ECR.

When a new image is detected in either ECR Repository, a CodePipeline will be triggered to perform the deployment using the `Deployment` construct.
This pipeline will take the `imageDetail.json` file that was output by the ECR Source Action, and convert it to an `imagedefinitions.json` file that ECS needs for deployments.

Once the file is ready for deployment, a manual approval step requires the developer to approve the deployment. Once approved, the new image will be deployed to the appropriate ECS Service.

### Multiple Environments

Under normal circumstances, this solution would be deployed to at least 2 environments; a testing/staging env, and a production one.
When a new image is detected in ECR, it would first be deployed fully (without approval) to the testing environment, and then with manual approval to production.

However since I am actually hosting this solution on my own personal AWS account, I intentionally did not create a testing environment to reduce my personal operating costs.

### Notes

The generated CloudFormation templates for the solution can be found at:
- [Infrastructure](./CloudFormation-infra.json)
- [Application](./CloudFormation-application.json)

Given a more complex solution and more time, better solutions would be:
- Use CodeDeploy to manage deployments at a more controllable level
- Use Step Functions to handle canary deployments with multiple steps and traffic levels


