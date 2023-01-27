import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { DefaultInstanceTenancy, IpAddresses, Vpc, VpcProps } from 'aws-cdk-lib/aws-ec2';

export class Vpcs {
  public vpc: Vpc
  constructor(scope: Construct, id: string) {
    this.vpc = new Vpc(scope, id, {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      defaultInstanceTenancy: DefaultInstanceTenancy.DEFAULT,
      enableDnsSupport: true,
      enableDnsHostnames: true,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "App",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: "RDS",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      natGateways: 1,
      // maxAzs: 2,
    });
    this.vpc.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
  }
}
  