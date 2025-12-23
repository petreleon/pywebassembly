// src/components/ProblemManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProblemSolver } from "./ProblemSolver";
import { Problem } from "@/types/problem";
import defaultProblems from "@/data/problems.json";
import { Download, Upload, Save, RefreshCw } from "lucide-react";

export const ProblemManager: React.FC = () => {
    const [problem, setProblem] = useState<Problem | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("current-problem");
        if (saved) {
            try {
                setProblem(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved problem", e);
                setProblem(defaultProblems[0]);
            }
        } else {
            setProblem(defaultProblems[0]);
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage whenever problem changes
    useEffect(() => {
        if (problem && isLoaded) {
            localStorage.setItem("current-problem", JSON.stringify(problem));
        }
    }, [problem, isLoaded]);

    const handleExport = () => {
        if (!problem) return;
        // Generate dynamic filename from title
        const filename = problem.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `problem-${problem.id}`;

        // Create a copy of the problem with the updated ID to match the filename
        const problemToExport = {
            ...problem,
            id: filename
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problemToExport, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${filename}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            fileReader.readAsText(event.target.files[0], "UTF-8");
            fileReader.onload = (e) => {
                try {
                    const result = e.target?.result as string;
                    const importedProblem = JSON.parse(result) as Problem;
                    // Basic validation could go here
                    if (importedProblem.title && importedProblem.testCases) {
                        setProblem(importedProblem);
                    } else {
                        alert("Invalid problem JSON format");
                    }
                } catch (error) {
                    alert("Error parsing JSON file");
                }
            };
        }
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset to the default problem? All changes will be lost.")) {
            setProblem(defaultProblems[0]);
        }
    }

    if (!problem) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-end bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-colors">
                    <Upload size={16} />
                    Import JSON
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-sm font-semibold transition-colors"
                >
                    <Download size={16} /> Export JSON
                </button>

                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-semibold transition-colors"
                    title="Reset to Default"
                >
                    <RefreshCw size={16} /> Reset
                </button>
            </div>

            <ProblemSolver
                problem={problem}
                onUpdate={(updates) => setProblem({ ...problem, ...updates })}
            />
        </div>
    );
};
