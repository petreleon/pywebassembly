export interface TestCase {
    input: string;
    expected: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    starterCode: string;
    testCases: TestCase[];
}
