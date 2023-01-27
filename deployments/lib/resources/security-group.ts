import { StackProps } from "aws-cdk-lib";
import { Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface SecurityGroupProps extends StackProps {
    vpc: Vpc;
}

export class SecurityGroups {
    public ecsSecurityGroup: SecurityGroup;
    public rdsSecurityGroup: SecurityGroup;

    constructor(scope: Construct, id: string, props: SecurityGroupProps){
        this.ecsSecurityGroup = new SecurityGroup(scope, 'PointCoreEcsSg', {
            vpc: props.vpc,
        })
        this.rdsSecurityGroup = new SecurityGroup(scope, 'PointCoreRdsSg', {
            vpc: props.vpc,
            allowAllOutbound: true,
        });
        this.rdsSecurityGroup.connections.allowFrom(this.ecsSecurityGroup, Port.tcp(5432), "Ingress 5432 from ECS");
    }
}