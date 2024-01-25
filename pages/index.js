import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('react-json-view'), { ssr: false });

const Home = () => {
  const [importedJson, setImportedJson] = useState(null);
  const [vercelJson, setVercelJson] = useState(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        const jsonData = await readFile(file);
        const parsedJson = JSON.parse(jsonData);
        setImportedJson(parsedJson);

        // Generate Vercel JSON format
        const { redirects } = parsedJson;
        const convertedArray = redirects.map((obj) => ({
          source: obj.match_url || '/',
          destination: obj.action_data.url || '/',
          permanent: obj.action_code === 301,
        }));
        const vercelJsonData = { redirects: convertedArray };
        setVercelJson(vercelJsonData);
      } catch (error) {
        console.error('Error reading or processing JSON file:', error);
      }
    }
  };

  const handleExport = () => {
    const fileName = 'vercel.json';
    const blob = new Blob([JSON.stringify(vercelJson, null, 2)], {
      type: 'application/json',
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const readFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(event.target.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  };

  return (
    <div className="w-full min-h-screen p-4">
      <div className="flex items-center mb-4">
        <h1 className="text-3xl font-bold">
          WordPress Redirects JSON to Vercel JSON
        </h1>
      </div>
      <div className="flex items-center justify-center">
        <form className="bg-white w-full h-full shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="w-full mx-auto flex">
            {/* Left Column */}
            <div className="mr-4 flex-1">
              <h2 className="text-xl font-bold mb-4">Import JSON Data</h2>
              <label className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer">
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                Choose a file
              </label>
              {importedJson && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Imported JSON:</h3>
                  <ReactJson src={importedJson} theme="rjv-default" />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Export Vercel JSON</h2>
              {vercelJson && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">Formatted Vercel JSON:</h3>
                  <ReactJson src={vercelJson} theme="rjv-default" />
                  <button onClick={handleExport} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">
                    Export Vercel JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>

  );
};

export default Home;
