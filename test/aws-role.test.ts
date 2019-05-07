import test from "ava";
import { IAM } from "aws-sdk";
import uuidv4 from "uuid/v4";
import { faastAws } from "../index";
import {
    deleteRole,
    ensureRole,
    createAwsApis,
    deleteResources,
    ensureRoleRaw
} from "../src/aws/aws-faast";
import * as funcs from "./fixtures/functions";
import { sleep } from "../src/shared";
import { title } from "./fixtures/util";

/**
 * The policies tested here should match those in the documentation at
 * {@link AwsOptions.RoleName}.
 */
test(title("aws", "custom role"), async t => {
    t.plan(1);
    const iam = new IAM();
    const uuid = uuidv4();
    const RoleName = `faast-test-custom-role-${uuid}`;
    let faastModule;
    let PolicyArn;
    try {
        const AssumeRolePolicyDocument = JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Principal: { Service: "lambda.amazonaws.com" },
                    Action: "sts:AssumeRole",
                    Effect: "Allow"
                }
            ]
        });
        await iam
            .createRole({
                AssumeRolePolicyDocument,
                RoleName,
                Description: "test custom role for lambda functions created by faast"
            })
            .promise();

        const PolicyDocument = JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Action: ["logs:*"],
                    Resource: "arn:aws:logs:*:*:log-group:faast-*"
                },
                {
                    Effect: "Allow",
                    Action: ["sqs:*"],
                    Resource: "arn:aws:sqs:*:*:faast-*"
                }
            ]
        });

        const executionPolicy = await iam
            .createPolicy({
                Description: "test faast custom role policy",
                PolicyName: RoleName,
                PolicyDocument
            })
            .promise();

        PolicyArn = executionPolicy.Policy!.Arn!;
        await iam.attachRolePolicy({ RoleName, PolicyArn }).promise();

        await sleep(30 * 1000);

        faastModule = await faastAws(funcs, {
            RoleName,
            gc: "off"
        });
        t.is(await faastModule.functions.identity("hello"), "hello");
    } finally {
        faastModule && (await faastModule.cleanup());
        await deleteRole(RoleName, iam);
        PolicyArn && (await iam.deletePolicy({ PolicyArn }).promise());
    }
});

test(title("aws", "unit test ensureRole"), async t => {
    let role: IAM.Role | undefined;
    t.plan(3);
    const RoleName = `faast-test-ensureRole-${uuidv4()}`;
    try {
        const services = await createAwsApis("us-west-2");
        role = await ensureRole(RoleName, services, true);
        t.truthy(role.Arn);
        const role2 = await ensureRole(RoleName, services, true);
        t.is(role.Arn, role2.Arn);
    } finally {
        const services = await createAwsApis("us-west-2");
        await deleteResources({ RoleName }, services, () => {});
        const role3 = await services.iam
            .getRole({ RoleName })
            .promise()
            .catch(_ => {});
        t.true(role3 === undefined);
    }
});

test(title("aws", "unit test missing role name"), async t => {
    const RoleName = `faast-test-ensureRole-${uuidv4()}`;
    t.plan(1);
    const services = await createAwsApis("us-west-2");
    try {
        await ensureRole(RoleName, services, false);
    } catch (err) {
        t.true(true);
    }
});

test(title("aws", "race condition in role creation"), async t => {
    const RoleName = `faast-test-ensureRole-${uuidv4()}`;
    t.plan(3);
    const services = await createAwsApis("us-west-2");
    const promises: Promise<IAM.Role>[] = [];
    try {
        for (let i = 0; i < 3; i++) {
            promises.push(ensureRoleRaw(RoleName, services, true));
        }
        const results = await Promise.all(promises);
        const Arn = results[0].Arn;
        results.forEach(role => t.is(role.Arn, Arn));
    } finally {
        await deleteResources({ RoleName }, services, () => {});
    }
});
