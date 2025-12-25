// src/components/ProblemManager.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ProblemSolver } from "./ProblemSolver";
import { Problem, ProblemCategory } from "@/types/problem";
import defaultProblemsData from "@/data/problems.json";
import { Download, Upload, RefreshCw, ChevronRight, ChevronDown } from "lucide-react";

const categories = defaultProblemsData as unknown as ProblemCategory[];

export const ProblemManager: React.FC = () => {
    // Flatten all problems for easier search/lookup if needed, 
    // but we will primarily work with strict category selection.

    const [selectedCategoryName, setSelectedCategoryName] = useState<string>(categories[0]?.name || "");
    const [problem, setProblem] = useState<Problem | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [resetSolutionTrigger, setResetSolutionTrigger] = useState(0);

    // Initialize logic
    useEffect(() => {
        // Try to load last used problem ID
        const savedId = localStorage.getItem("current-problem-id");
        let initialProblem: Problem | undefined;

        if (savedId) {
            // Find in categories
            for (const cat of categories) {
                const found = cat.problems.find(p => p.id === savedId);
                if (found) {
                    initialProblem = found;
                    setSelectedCategoryName(cat.name);
                    break;
                }
            }
        }

        // Fallback to first problem of first category
        if (!initialProblem && categories.length > 0 && categories[0].problems.length > 0) {
            initialProblem = categories[0].problems[0];
            setSelectedCategoryName(categories[0].name);
        }

        if (initialProblem) {
            // Load saved state for this specific problem if exists, otherwise use default
            const savedState = localStorage.getItem(`problem-state-${initialProblem.id}`);
            if (savedState) {
                try {
                    setProblem(JSON.parse(savedState));
                } catch (e) {
                    setProblem(initialProblem);
                }
            } else {
                setProblem(initialProblem);
            }
        }

        setIsLoaded(true);
    }, []);

    // Save current problem state
    useEffect(() => {
        if (problem && isLoaded) {
            localStorage.setItem(`problem-state-${problem.id}`, JSON.stringify(problem));
            localStorage.setItem("current-problem-id", problem.id);
        }
    }, [problem, isLoaded]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catName = e.target.value;
        setSelectedCategoryName(catName);
        const cat = categories.find(c => c.name === catName);
        if (cat && cat.problems.length > 0) {
            setProblem(cat.problems[0]);
        }
    };

    const handleProblemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const probId = e.target.value;
        const cat = categories.find(c => c.name === selectedCategoryName);
        const prob = cat?.problems.find(p => p.id === probId);
        if (prob) {
            setProblem(prob);
        }
    };

    const currentCategory = categories.find(c => c.name === selectedCategoryName);


    const handleExport = () => {
        if (!problem) return;
        const filename = problem.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `problem-${problem.id}`;

        const problemToExport = { ...problem, id: filename };
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
                    if (importedProblem.title && importedProblem.testCases) {
                        setProblem(importedProblem);
                        // We might not set category/id in storage effectively for imported ones unless we match them to existing IDs
                    } else {
                        alert("Invalid problem JSON format");
                    }
                } catch {
                    alert("Error parsing JSON file");
                }
            };
        }
    };

    const handleFactoryReset = () => {
        if (!problem) return;
        if (confirm("Factory Reset: Are you sure you want to reset EVERYTHING to default?")) {
            // Find original default
            let original: Problem | undefined;
            for (const cat of categories) {
                const found = cat.problems.find(p => p.id === problem.id);
                if (found) {
                    original = found;
                    break;
                }
            }

            if (original) {
                localStorage.removeItem(`solution-${problem.id}`);
                setProblem(original);
            }
        }
    }

    const handleResetSolution = () => {
        if (confirm("Are you sure you want to reset your solution code?")) {
            setResetSolutionTrigger(prev => prev + 1);
        }
    }

    if (!isLoaded || !problem) return <div className="p-4 text-center text-gray-400">Loading problems...</div>;

    return (
        <div className="space-y-6">
            {/* Top Bar: Selection & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-800">

                {/* Problem Selection */}
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <select
                        value={selectedCategoryName}
                        onChange={handleCategoryChange}
                        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {categories.map(cat => (
                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <ChevronRight size={16} className="text-gray-500 hidden md:block" />

                    <select
                        value={problem.id}
                        onChange={handleProblemChange}
                        className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 flex-grow md:flex-grow-0 md:min-w-[200px]"
                    >
                        {currentCategory?.problems.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 items-center justify-end">
                    <label className="flex items-center gap-2 cursor-pointer bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-blue-500/30">
                        <Upload size={14} />
                        Import
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-emerald-500/30"
                    >
                        <Download size={14} /> Export
                    </button>

                    <button
                        onClick={handleResetSolution}
                        className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-3 py-1.5 rounded text-sm font-medium transition-colors border border-gray-600/50"
                        title="Reset your solution code to starter code"
                    >
                        <RefreshCw size={14} /> Reset
                    </button>
                </div>
            </div>

            <ProblemSolver
                key={problem.id} // Re-mount when problem changes to reset internal state if strictly needed, or let component handle updates
                problem={problem}
                onUpdate={(updates) => setProblem({ ...problem, ...updates })}
                onFactoryReset={handleFactoryReset}
                resetSolutionTrigger={resetSolutionTrigger}
            />
        </div>
    );
};
