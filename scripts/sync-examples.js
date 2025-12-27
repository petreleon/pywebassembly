const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'petreleon';
const REPO_NAME = 'pywebassembly-examples';
const BRANCH = 'main'; // or 'master', depending on default
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

const OUTPUT_FILE = path.join(__dirname, '../src/data/problems.json');

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'node.js/script',
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.json();
}

async function fetchRaw(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return response.text();
}

async function main() {
    console.log(`Fetching examples from ${REPO_OWNER}/${REPO_NAME}...`);

    try {
        // 1. List root directory
        const rootContents = await fetchJson(API_BASE);

        // 2. Filter for directories (e.g., starting with 01_, 02_, etc.)
        // You can adjust this filter to match whatever folder naming convention you want to capture
        const categoryDirs = rootContents.filter(item =>
            item.type === 'dir' && /^[0-9]+_/.test(item.name)
        );

        const categories = [];

        for (const dir of categoryDirs) {
            console.log(`Processing category: ${dir.name}`);

            // 3. Fetch contents of the directory
            const dirContents = await fetchJson(dir.url);

            // 4. Filter for .json files
            const problemFiles = dirContents.filter(item =>
                item.type === 'file' && item.name.endsWith('.json')
            );

            const problemsWithMetadata = [];

            for (const fileItem of problemFiles) {
                console.log(`  Downloading problem: ${fileItem.name}`);
                try {
                    // Fetch raw content
                    // We can use download_url provided by API or construct it
                    const rawContent = await fetchRaw(fileItem.download_url);
                    const problemData = JSON.parse(rawContent);

                    // Basic validation
                    if (problemData.id && problemData.title) {
                        problemsWithMetadata.push({
                            data: problemData,
                            filename: fileItem.name
                        });
                    } else {
                        console.warn(`    Skipping ${fileItem.name}: Missing id or title`);
                    }
                } catch (err) {
                    console.error(`    Error processing ${fileItem.name}:`, err.message);
                }
            }

            // Sort problems by filename (XX_...)
            problemsWithMetadata.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' }));

            const problems = problemsWithMetadata.map(p => p.data);

            if (problems.length > 0) {
                categories.push({
                    name: dir.name, // Uses the folder name as the category name
                    problems: problems
                });
            }
        }

        // Sort categories by name
        categories.sort((a, b) => a.name.localeCompare(b.name));

        // 5. Write to file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, 2));
        console.log(`\nSuccessfully wrote ${categories.length} categories to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
}

main();
