"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CodeEditor } from "./CodeEditor";
import { usePython } from "@/lib/usePython";
import { Play, CheckCircle, XCircle, Edit2, Check, Plus, Trash2, RotateCcw } from "lucide-react";
import { Problem, TestCase } from "@/types/problem";

interface ProblemSolverProps {
    problem: Problem;
    onUpdate: (updates: Partial<Problem>) => void;
    onFactoryReset: () => void;
    resetSolutionTrigger: number;
}

interface TestResult {
    passed: boolean;
    actual: string;
    expected: string;
    input: string;
    error?: string;
}

export const ProblemSolver: React.FC<ProblemSolverProps> = ({ problem, onUpdate, onFactoryReset, resetSolutionTrigger }) => {
    const [code, setCode] = useState(problem.starterCode);
    const [isProblemEditMode, setIsProblemEditMode] = useState(false);

    const { runPython, output, isRunning } = usePython();

    // Listen for parent reset solution trigger
    useEffect(() => {
        if (resetSolutionTrigger > 0) {
            setTimeout(() => {
                setCode(problem.starterCode);
            }, 0);
            localStorage.setItem(`solution-${problem.id}`, problem.starterCode);
        }
    }, [resetSolutionTrigger, problem.starterCode, problem.id]);

    // Load solution from local storage on mount
    useEffect(() => {
        const savedKey = `solution-${problem.id}`;
        const savedSolution = localStorage.getItem(savedKey);
        if (savedSolution !== null) {
            setTimeout(() => {
                setCode(savedSolution);
            }, 0);
        }
    }, [problem.id]); // Empty dependency array as we rely on parent 'key' to remount on problem change

    // Save solution to local storage whenever code changes
    useEffect(() => {
        if (!isProblemEditMode) {
            localStorage.setItem(`solution-${problem.id}`, code);
        }
    }, [code, problem.id, isProblemEditMode]);

    // Derived state for results
    const results = useMemo(() => {
        if (isRunning || output.length === 0) return null;
        const lastLine = output[output.length - 1];
        try {
            const parsedResults = JSON.parse(lastLine);
            if (Array.isArray(parsedResults)) {
                return parsedResults as TestResult[];
            }
        } catch {
            // Ignore non-JSON output
        }
        return null;
    }, [isRunning, output]);

    const handleRun = () => {
        // When running, we always run the CURRENT EDITOR CONTENT if we are in solution mode.
        // If in Edit Mode, we probably shouldn't run, or we should run the starter code?
        // Let's assume run matches what's visible.
        const codeToRun = isProblemEditMode ? problem.starterCode : code;

        // Indent code for the try block
        const indentedCode = codeToRun.split('\n').map(line => '    ' + line).join('\n');

        const safeRunScript = `
import json
import sys

# User Code Block
try:
${indentedCode}
except Exception as e:
    print(json.dumps([{"passed": False, "input": "Global Scope", "actual": str(e), "expected": "-", "error": "Error executing user code"}]))
    sys.exit(0)

# Test Runner Block
def run_tests_internal():
    results = []
    test_cases = ${JSON.stringify(problem.testCases)}
    
    for test in test_cases:
        try:
            actual_val = eval(test['input'])
            expected_val = eval(test['expected'])
            
            passed = actual_val == expected_val
            results.append({
                "passed": passed,
                "input": test['input'],
                "actual": repr(actual_val),
                "expected": repr(expected_val)
            })
        except Exception as e:
            results.append({
                "passed": False,
                "input": test['input'],
                "actual": "Error",
                "expected": test['expected'],
                "error": str(e)
            })
    print(json.dumps(results))

run_tests_internal()
`;
        runPython(safeRunScript);
    };

    const handleUpdateTestCase = (index: number, field: keyof TestCase, value: string) => {
        const newTestCases = [...problem.testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        onUpdate({ testCases: newTestCases });
    };

    const handleAddTestCase = () => {
        onUpdate({ testCases: [...problem.testCases, { input: "", expected: "" }] });
    };

    const handleRemoveTestCase = (index: number) => {
        const newTestCases = problem.testCases.filter((_, i) => i !== index);
        onUpdate({ testCases: newTestCases });
    }

    return (
        <div className="flex flex-col h-full gap-4 p-4 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 mr-4 space-y-2">
                        {isProblemEditMode ? (
                            <>
                                <input
                                    value={problem.title}
                                    onChange={(e) => onUpdate({ title: e.target.value })}
                                    className="bg-gray-800 text-white text-2xl font-bold w-full p-2 rounded border border-gray-700 focus:border-blue-500 outline-none"
                                    placeholder="Problem Title"
                                />
                                <textarea
                                    value={problem.description}
                                    onChange={(e) => onUpdate({ description: e.target.value })}
                                    className="bg-gray-800 text-gray-300 w-full p-2 rounded border border-gray-700 min-h-[80px] focus:border-blue-500 outline-none"
                                    placeholder="Problem Description"
                                />
                            </>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-blue-400">{problem.title}</h2>
                                <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
                            </>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                            {isProblemEditMode && (
                                <button
                                    onClick={onFactoryReset}
                                    className="flex items-center gap-2 px-3 py-1 rounded text-sm bg-red-700 hover:bg-red-600 transition-colors"
                                    title="Reset everything (tests, description) to default"
                                >
                                    <RotateCcw size={14} /> Factory Reset
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    // If we are about to exit edit mode, allow reset
                                    if (isProblemEditMode) {
                                        // Reset code to the (potentially updated) starter code
                                        setCode(problem.starterCode);
                                    }
                                    setIsProblemEditMode(!isProblemEditMode);
                                }}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${isProblemEditMode ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {isProblemEditMode ? <><Check size={14} /> Done Editing</> : <><Edit2 size={14} /> Edit Problem</>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                        {/* Editor Mode label and lock button removed */}
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Play size={18} /> Run {isProblemEditMode ? "Starter Code" : "Code"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px]">
                {/* Editor Column */}
                <div className={`relative flex flex-col transition-all`}>
                    {isProblemEditMode && (
                        <div className="bg-amber-600/90 text-white text-xs px-2 py-1 rounded-t flex justify-between items-center">
                            <span className="font-bold">EDITING STARTER CODE</span>
                            <span>This code will be presented to users when they reset the problem.</span>
                        </div>
                    )}

                    <div className={`flex-1 ${isProblemEditMode ? 'border-2 border-t-0 border-amber-600/50 rounded-b-md' : ''}`}>
                        <CodeEditor
                            key={isProblemEditMode ? "starter-editor" : "solution-editor"}
                            initialValue={isProblemEditMode ? problem.starterCode : code}
                            onChange={(val) => {
                                if (isProblemEditMode) {
                                    onUpdate({ starterCode: val || "" });
                                } else {
                                    setCode(val || "");
                                }
                            }}
                            // Removing readOnly prop since we always want to edit either solution or starter code
                            readOnly={false}
                        />
                    </div>
                </div>

                {/* Output/Tests Column */}
                <div className="bg-gray-900 rounded-md p-4 overflow-y-auto text-gray-200 font-mono border border-gray-700 flex flex-col gap-6">

                    {/* Test Cases Editing or Viewing */}
                    <div>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-700">
                            <h3 className="text-lg font-semibold">Test Cases</h3>
                            {isProblemEditMode && (
                                <button onClick={handleAddTestCase} className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                                    <Plus size={12} /> Add Case
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {problem.testCases.map((test, idx) => (
                                <div key={idx} className="p-3 bg-gray-800/50 rounded border border-gray-700">
                                    {isProblemEditMode ? (
                                        <div className="flex gap-2 items-start">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-16">Input:</span>
                                                    <input
                                                        value={test.input}
                                                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                                                        className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm w-full font-mono outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-500 w-16">Expected:</span>
                                                    <input
                                                        value={test.expected}
                                                        onChange={(e) => handleUpdateTestCase(idx, 'expected', e.target.value)}
                                                        className="bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm w-full font-mono outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <button onClick={() => handleRemoveTestCase(idx)} className="p-2 text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <code className="text-blue-300">{test.input}</code>
                                            <span className="text-gray-500">→</span>
                                            <code className="text-green-300">{test.expected}</code>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Results</h3>
                        {isRunning && <div className="text-yellow-400 animate-pulse mb-2">Running code...</div>}

                        <div className="space-y-2">
                            {results ? (
                                results.map((res, idx) => (
                                    <div key={idx} className={`p-2 rounded flex items-start gap-3 ${res.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                                        <div className="mt-1">
                                            {res.passed ? <CheckCircle className="text-green-500" size={16} /> : <XCircle className="text-red-500" size={16} />}
                                        </div>
                                        <div className="text-sm">
                                            <div className="font-bold">{res.input}</div>
                                            {!res.passed && (
                                                <div className="mt-1 space-y-1 text-xs opacity-90">
                                                    {res.error ? (
                                                        <div className="text-red-400 break-all">Error: {res.error}</div>
                                                    ) : (
                                                        <>
                                                            <div>Expected: <span className="text-green-400">{res.expected}</span></div>
                                                            <div>Actual: <span className="text-red-400">{res.actual}</span></div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !isRunning && <div className="text-gray-500 italic text-sm">Run code to see test results.</div>
                            )}
                        </div>
                    </div>

                    {/* Console Output */}
                    <div className="flex-1 min-h-0 flex flex-col">
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Console Output</h4>
                        <pre className="flex-1 bg-black/50 p-2 rounded text-xs overflow-auto font-mono text-gray-300">
                            {output.map((line, i) => {
                                if (line.trim().startsWith('[{"passed":')) return null;
                                return <div key={i}>{line}</div>
                            })}
                        </pre>
                    </div>

                </div>
            </div>
        </div>
    );
};
