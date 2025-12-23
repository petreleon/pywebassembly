import { useEffect, useRef, useState, useCallback } from "react";

interface PyodideResult {
    results: any;
    stdout: string;
    error?: string;
}

export function usePython() {
    const workerRef = useRef<Worker | null>(null);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        workerRef.current = new Worker("/pyodide-worker.js");

        workerRef.current.onmessage = (event) => {
            const { id, results, stdout, error } = event.data;
            setIsRunning(false);

            if (error) {
                setOutput((prev) => [...prev, `Error: ${error}`]);
            } else {
                if (stdout) {
                    setOutput((prev) => [...prev, stdout]);
                }
                if (results !== undefined) {
                    // Optional: log result if needed, currently just stdout is main focus for basic runner
                    // setOutput((prev) => [...prev, `Result: ${results}`]);
                }
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const runPython = useCallback((code: string) => {
        setOutput([]); // Clear previous output
        setIsRunning(true);
        workerRef.current?.postMessage({
            id: Date.now(),
            python: code,
        });
    }, []);

    return { runPython, output, isRunning };
}
