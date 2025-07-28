// import React, { useEffect, useRef, useState } from "react";
// import axios from "axios";

// const TranscriptInput = () => {
//   const [file, setFile] = useState(null);
//   const [transcript, setTranscript] = useState("");
//   const [summary, setSummary] = useState("");
//   const [actionItems, setActionItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [cancelTokenSource, setCancelTokenSource] = useState(null);
//   const fileInputRef = useRef(null);

//   // Check for extension data on component mount
//   useEffect(() => {
//     const checkForExtensionData = () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       if (urlParams.get('source') === 'extension') {
//         // Chrome extension context
//         if (typeof chrome !== 'undefined' && chrome.storage) {
//           chrome.storage.local.get(['zoomTranscript'], (result) => {
//             if (result.zoomTranscript) {
//               setTranscript(result.zoomTranscript);
//               processTranscript(result.zoomTranscript);
//               // Clear the stored transcript after retrieval
//               chrome.storage.local.remove(['zoomTranscript']);
//             }
//           });
//         }
//       }
//     };

//     checkForExtensionData();
//   }, []);

//   const handleFileChange = (e) => setFile(e.target.files[0]);

//   const processTranscript = async (text) => {
//     setLoading(true);
//     const source = axios.CancelToken.source();
//     setCancelTokenSource(source);

//     try {
//       const res = await axios.post('http://localhost:8000/transcribe', {
//         text: text || transcript
//       }, {
//         cancelToken: source.token
//       });

//       setSummary(res.data.summary?.map((s) => s.summary).join('\n') || '');
//       setActionItems(res.data.action_items || []);
//     } catch (err) {
//       if (!axios.isCancel(err)) {
//         console.error('Error:', err);
//         alert("Processing failed");
//       }
//     } finally {
//       setLoading(false);
//       setCancelTokenSource(null);
//     }
//   };

//   const handleUpload = async () => {
//     if (file) {
//       setLoading(true);
//       const source = axios.CancelToken.source();
//       setCancelTokenSource(source);

//       const formData = new FormData();
//       formData.append('file', file);

//       try {
//         const res = await axios.post('http://localhost:8000/transcribe', formData, {
//           cancelToken: source.token
//         });

//         if (!res.data?.transcript) throw new Error("Invalid response");
        
//         setTranscript(res.data.transcript);
//         setSummary(res.data.summary?.map((s) => s.summary).join('\n') || '');
//         setActionItems(res.data.action_items || []);
//       } catch (err) {
//         if (!axios.isCancel(err)) {
//           console.error('Error uploading:', err);
//           alert("❌ Failed to upload. Please check your backend.");
//         }
//       } finally {
//         setLoading(false);
//         setCancelTokenSource(null);
//       }
//     } else if (transcript) {
//       await processTranscript();
//     } else {
//       alert("No content to process!");
//     }
//   };

//   const handleClear = () => {
//     if (cancelTokenSource) {
//       cancelTokenSource.cancel("User cancelled the operation");
//     }
//     setFile(null);
//     setTranscript('');
//     setSummary('');
//     setActionItems([]);
//     setLoading(false);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const generateExportText = () => {
//     let text = "📝 Meeting Summary:\n";
//     text += summary + "\n\n";
//     text += "✅ Action Items:\n";
//     text += Array.isArray(actionItems)
//       ? actionItems.map(item => 
//           `- ${item.task} [Owner: ${item.owner}] [Deadline: ${item.deadline}]`
//         ).join("\n")
//       : "No action items.";
//     return text;
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(generateExportText());
//     alert("Copied to clipboard!");
//   };

//   const handleDownload = () => {
//     const blob = new Blob([generateExportText()], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "meeting-summary.txt";
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const generateMailtoLink = () =>
//     `mailto:?subject=Meeting Summary&body=${encodeURIComponent(generateExportText())}`;

//   const handleExportToNotion = () => {
//     alert("🔧 Export to Notion functionality coming soon!");
//   };

//   return (
//     <div className="bg-gray-900 border border-teal-500 rounded-xl p-6 shadow-lg text-gray-100">
//       <h2 className="text-xl font-semibold text-teal-400 mb-4">
//         {window.location.search.includes('source=extension') 
//           ? "Meeting Summary" 
//           : "📄 Upload File"}
//       </h2>

//       {!window.location.search.includes('source=extension') && (
//         <div className="mb-4">
//           <label
//             htmlFor="file-upload"
//             className="cursor-pointer bg-gray-800 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-700 border border-teal-500 inline-block"
//           >
//             {file ? file.name : "Select a Text or Audio file"}
//           </label>
//           <input
//             id="file-upload"
//             type="file"
//             onChange={handleFileChange}
//             className="hidden"
//             ref={fileInputRef}
//           />
//         </div>
//       )}

//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={handleUpload}
//           disabled={loading}
//           className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
//         >
//           {loading ? "Processing..." : "Generate Summary"}
//         </button>
//         <button
//           onClick={handleClear}
//           className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded"
//         >
//           Clear
//         </button>
//       </div>

//       {summary && (
//         <div className="mb-4">
//           <h4 className="text-teal-300 mb-2">📝 Summary</h4>
//           <p className="whitespace-pre-wrap text-gray-300">{summary}</p>
//         </div>
//       )}

//       {Array.isArray(actionItems) && actionItems.length > 0 && (
//         <div className="mb-4">
//           <h4 className="text-green-400 mb-2">✅ Action Items</h4>
//           <ul className="list-disc list-inside text-gray-300">
//             {actionItems.map((item, index) => (
//               <li key={index} className="mb-2">
//                 <strong>Task:</strong> {item.task} <br />
//                 <strong>Owner:</strong> {item.owner || 'Unassigned'} <br />
//                 <strong>Deadline:</strong> {item.deadline || 'Not specified'}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {(summary || actionItems.length > 0) && (
//         <div className="flex flex-col gap-2 mt-4">
//           <button
//             onClick={handleCopy}
//             className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
//           >
//             📋 Copy to Clipboard
//           </button>
//           <button
//             onClick={handleDownload}
//             className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//           >
//             💾 Download Summary
//           </button>
//           <a
//             href={generateMailtoLink()}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-center"
//           >
//             📧 Send via Email
//           </a>
//           <button
//             onClick={handleExportToNotion}
//             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
//           >
//             📓 Export to Notion
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TranscriptInput;


























//final  project
import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = "https://kr-ai-meeting-bot.onrender.com"

const TranscriptInput = () => {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true);
    try {
      let res;

      // ✅ If file is selected, upload that
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await axios.post(`${BASE_URL}/transcribe`, formData);
      } else {
        // ✅ If no file, just use backend's saved meeting.txt from Chrome Extension
        res = await axios.post(`${BASE_URL}/transcribe/from-file`);
      }

      setTranscript(res.data.transcript || '');
      setSummary(res.data.summary?.map((s) => s.summary).join('\n') || 'No summary available');
      setActionItems(res.data.action_items || []);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('❌ Upload failed. Make sure "meeting.txt" exists in backend /transcripts/ folder or upload a file.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setTranscript('');
    setSummary('');
    setActionItems([]);
  };

  const handleCopy = () => {
    const text = generateExportText();
    navigator.clipboard.writeText(text);
    alert('📋 Copied to clipboard!');
  };

  const handleDownload = () => {
    const text = generateExportText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMailtoLink = () => {
    const text = generateExportText();
    return `mailto:?subject=Meeting Summary&body=${encodeURIComponent(text)}`;
  };

  const generateExportText = () => {
    let text = '📝 Meeting Summary:\n';
    text += summary + '\n\n';
    text += '✅ Action Items:\n';
    if (Array.isArray(actionItems)) {
      text += actionItems
        .map((item) => `- ${item.task} [Owner: ${item.owner}] [Deadline: ${item.deadline}]`)
        .join('\n');
    } else {
      text += 'No action items.';
    }
    return text;
  };

  const handleExportToNotion = () => {
    alert('📓 Export to Notion feature coming soon!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border dark:border-gray-700">
      <br></br>
      <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">📄 Upload File</h2>

      {/* ✅ yaha file input ko akela ek column banaya */}
      <div className="mb-4">
        <label className="inline-block bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-center"> {/* ✅ yaha change kiya */}
          {file ? file.name : 'Select a text or audio file'}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* ✅ yaha Generate Summary + Clear button ko same row me laaya */}
      <div className="flex gap-4 mb-4"> {/* ✅ yaha change kiya */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="border border-teal-600 text-teal-600 px-4 py-1.5 rounded hover:bg-teal-600 hover:text-white transition disabled:opacity-60" // ✅ yaha style same kiya jaise image me
        >
          {loading ? 'Processing...' : 'Generate Summary'}
        </button>

        <button
          onClick={handleClear}
          className="border border-gray-600 text-gray-600 px-4 py-1.5 rounded hover:bg-gray-600 hover:text-white transition" // ✅ yaha bhi same styling ki
        >
          Clear
        </button>
      </div>
      <br></br>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          Generate Zoom Meeting Summary
        </button>
      </div>

      {summary && (
        <div className="mb-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">📝 Summary</h4>
          <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-300">{summary}</p>
        </div>
      )}

      {Array.isArray(actionItems) && actionItems.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">✅ Action Items</h4>
          <ul className="list-disc list-inside text-gray-800 dark:text-gray-300">
            {actionItems.map((item, index) => (
              <li key={index}>
                <strong>Task:</strong> {item.task}<br />
                <strong>Owner:</strong> {item.owner}<br />
                <strong>Deadline:</strong> {item.deadline}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(summary || actionItems.length > 0) && (
        <div className="flex flex-col gap-2">
          <button onClick={handleCopy} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
            📋 Copy to Clipboard
          </button>
          <button onClick={handleDownload} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            💾 Download Summary
          </button>
          <a
            href={generateMailtoLink()}
            className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
          >
            📧 Send via Email
          </a>
          <button onClick={handleExportToNotion} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            📓 Export to Notion
          </button>
        </div>
      )}
    </div>
  );
};

export default TranscriptInput;


//changement start
