import { describeFeature } from '@amiceli/vitest-cucumber';

type DescribeFeatureFunction = Parameters<typeof describeFeature>[1];
type Scenario = Parameters<DescribeFeatureFunction>[0]['Scenario'];
type StepTest = Parameters<Parameters<Scenario>[1]>[0];

export type Step = StepTest['When'];
