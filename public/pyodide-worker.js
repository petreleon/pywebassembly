// public/pyodide-worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  // We can load packages here if needed, e.g. numpy
  // await pyodide.loadPackage("numpy");
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const { id, python, logic } = event.data;

  // Logic to handle different types of execution can go here.
  // For now, we just run the python code.
  
  try {
    // Redirect stdout/stderr
    let stdout = [];
    pyodide.setStdout({ batched: (msg) => stdout.push(msg) });
    pyodide.setStderr({ batched: (msg) => stdout.push(msg) }); // Combine for now or separate

    let result = await pyodide.runPythonAsync(python);
    
    self.postMessage({ id, results: result, stdout: stdout.join("\n") });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
