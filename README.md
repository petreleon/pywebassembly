# Python WebAssembly Editor

Aceasta este o aplicație web construită cu **Next.js** și **TypeScript** care permite execuția codului Python direct în browser folosind **Pyodide** (WebAssembly). Aplicația include un editor de cod performant (Monaco Editor) și un sistem de verificare automată a soluțiilor.

## 🚀 Funcționalități Principale

- **Execuție Python Client-Side**: Rulează cod Python direct în browser, fără a necesita un server backend pentru execuție, grație Pyodide.
- **Editor de Cod Avansat**: Integrează Monaco Editor pentru o experiență de scriere a codului similară cu VS Code.
- **Sistem de Testare**: Verificarea automată a soluțiilor utilizatorului pe baza unor cazuri de test predefinite.
- **Editor de Probleme**:
  - Modifică titlul, descrierea și codul de start al problemelor direct din interfață.
  - Adaugă sau șterge cazuri de test.
  - Editează "Starter Code" (șablonul inițial) pentru utilizatori.
- **Managementul Problemelor**:
  - **Export JSON**: Descarcă problema curentă într-un fișier JSON (numele fișierului și ID-ul sunt generate automat din titlu).
  - **Import JSON**: Încarcă probleme externe din fișiere JSON.
  - **Persistență**: Progresul și modificările problemei sunt salvate automat în `localStorage`.

## 🛠️ Tehnologii Utilizate

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Limbaj**: [TypeScript](https://www.typescriptlang.org/)
- **Python Runtime**: [Pyodide](https://pyodide.org/) (WebAssembly)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Instalare și Rulare

1.  **Clonează proiectul:**
    ```bash
    git clone https://github.com/petreleon/pywebassembly
    cd pywebassembly
    ```

2.  **Instalează dependințele:**
    ```bash
    npm install
    ```

3.  **Pornește serverul de dezvoltare:**
    ```bash
    npm run dev
    ```

4.  Deschide [http://localhost:3000](http://localhost:3000) în browser.

## 📝 Structura Fișierului de Problemă (JSON)

Un fișier de problemă exportat arată astfel:

```json
{
  "id": "suma-a-doua-numere",
  "title": "Suma a două numere",
  "description": "Scrie o funcție care returnează suma a două numere.",
  "starterCode": "def sum(a, b):\n    # Codul tău aici\n    pass",
  "testCases": [
    {
      "input": "sum(2, 3)",
      "expected": "5"
    },
    {
      "input": "sum(-1, 1)",
      "expected": "0"
    }
  ]
}
```

## ⚠️ Notă despre Web Worker

Execuția Python are loc într-un Web Worker separat (`public/pyodide-worker.js`) pentru a nu bloca interfața utilizatorului în timpul rulării codului.
