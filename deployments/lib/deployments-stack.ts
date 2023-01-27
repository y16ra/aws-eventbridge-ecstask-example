import * as cdk from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import {
  Cluster,
  ContainerImage,
  FargateTaskDefinition,
  LogDrivers,
} from "aws-cdk-lib/aws-ecs";
import { EventField, Rule } from "aws-cdk-lib/aws-events";
import { EcsTask } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { SecurityGroups } from "./resources/security-group";
import { Vpcs } from "./resources/vpcs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class EcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpcs(this, id + "Vpc").vpc;
    // SecurityGroup
    const sg = new SecurityGroups(this, id, {
      vpc: vpc,
    });
    // ECS Cluseter
    const cluster = new Cluster(this, id + "Cluster", {
      clusterName: "EventHandlerCluster",
      vpc: vpc,
    });
    // EventBridgeから起動するタスク定義
    const s3EventHandleTask = new FargateTaskDefinition(
      this,
      "s3EventHandleTask",
      {
        memoryLimitMiB: 512,
      }
    );
    s3EventHandleTask.addContainer("handlerTaskContainer", {
      containerName: "s3EventHandleTaskContainer",
      image: ContainerImage.fromAsset("../", {
        platform: Platform.LINUX_AMD64,
      }),
      command: ["/app"],
      logging: LogDrivers.awsLogs({ streamPrefix: "s3EventHandleTask" }),
    });
    s3EventHandleTask.addToTaskRolePolicy(
      new PolicyStatement({
        actions: ["s3:*"],
        resources: ["*"],
      })
    );
    // EventBrigeのルール定義とターゲットの設定
    const rule = new Rule(this, "s3EventRule", {
      ruleName: "s3EventRule",
      enabled: true,
      eventPattern: {
        source: ["aws.s3"],
        detailType: ["Object Created"],
        detail: {
          bucket: {
            name: ["eventbridge-ecstack-example-bucket"],
          },
        },
      },
      targets: [
        new EcsTask({
          cluster: cluster,
          taskDefinition: s3EventHandleTask,
          taskCount: 1,
          securityGroups: [sg.ecsSecurityGroup],
          containerOverrides: [
            {
              containerName: "s3EventHandleTaskContainer",
              environment: [
                {
                  name: "bucketName",
                  value: EventField.fromPath("$.detail.bucket.name"),
                },
                {
                  name: "objectKey",
                  value: EventField.fromPath("$.detail.object.key"),
                },
              ],
            },
          ],
        }),
      ],
    });
  }
}
