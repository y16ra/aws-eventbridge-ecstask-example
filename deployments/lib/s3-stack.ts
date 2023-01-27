import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3 } from "aws-cdk-lib";
import { Construct } from "constructs";

export class S3Stack extends cdk.Stack {
  // Create Bucket
  public bulkFilesBucket: s3.Bucket;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bulkFilesBucket = new s3.Bucket(this, "TestBucket", {
      bucketName: "eventbridge-ecstack-example-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      eventBridgeEnabled: true,
    });
  }
}
