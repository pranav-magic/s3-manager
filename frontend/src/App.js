import React, { useState, useEffect } from 'react';
import { FolderPlus, File, Folder, Trash2, Upload, ChevronLeft, Loader } from 'lucide-react';

const App = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/list?prefix=${currentPath}`);
      const data = await response.json();
      console.log(data)
      if (data.error) {
        setError(data.error);
      } else {
        setFiles(data.files);
        setFolders(data.folders);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentPath]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', currentPath);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to upload file');
    }
  };

  const handleFolderUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    formData.append('prefix', currentPath);

    try {
      const response = await fetch('http://localhost:5000/api/upload-folder', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to upload folder');
    }
  };

  const handleDelete = async (key) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete?key=${key}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const createFolder = async () => {
    if (!newFolderName) return;

    try {
      const response = await fetch('http://localhost:5000/api/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderName: newFolderName,
          prefix: currentPath,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewFolderName('');
        setShowNewFolderInput(false);
        fetchData();
      }
    } catch (err) {
      setError('Failed to create folder');
    }
  };

  const navigateUp = () => {
    const newPath = currentPath.split('/').slice(0, -2).join('/');
    setCurrentPath(newPath ? `${newPath}/` : '');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="border rounded p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              className="border rounded px-2 py-1 text-sm"
              onClick={navigateUp}
              disabled={!currentPath}
            >
              <ChevronLeft className="h-4 w-4 inline-block mr-1" />
              Back
            </button>
            <span className="text-sm text-gray-500">{currentPath || 'Root'}</span>
          </div>
          <div className="flex space-x-2">
            <button
              className="border rounded px-2 py-1 text-sm"
              onClick={() => setShowNewFolderInput(true)}
            >
              <FolderPlus className="h-4 w-4 inline-block mr-1" />
              New Folder
            </button>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
              />
              <button className="border rounded px-2 py-1 text-sm">
                <Upload className="h-4 w-4 inline-block mr-1" />
                Upload File
              </button>
            </label>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                webkitdirectory="true"
                onChange={handleFolderUpload}
              />
              <button className="border rounded px-2 py-1 text-sm">
                <Upload className="h-4 w-4 inline-block mr-1" />
                Upload Folder
              </button>
            </label>
          </div>
        </div>

        {/* New Folder Input */}
        {showNewFolderInput && (
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="border rounded px-2 py-1 flex-1"
            />
            <button className="border rounded px-2 py-1" onClick={createFolder}>
              Create
            </button>
            <button
              className="border rounded px-2 py-1"
              onClick={() => {
                setShowNewFolderInput(false);
                setNewFolderName('');
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {/* Folders */}
            {folders.map((folder) => (
              <div
                key={folder}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div
                  className="flex items-center space-x-2 cursor-pointer flex-1"
                  onClick={() => setCurrentPath(folder)}
                >
                  <Folder className="h-5 w-5 text-blue-500" />
                  <span>{folder.split('/').slice(-2)[0]}</span>
                </div>
                <button
                  className="border rounded px-2 py-1"
                  onClick={() => handleDelete(folder)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file.key}
                className="flex flex-col p-2 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <File className="h-5 w-5 text-gray-500" />
                    <span>{file.key.split('/').pop()}</span>
                    <span className="text-sm text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <button
                    className="border rounded px-2 py-1"
                    onClick={() => handleDelete(file.key)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                {/* Metadata Display */}
                {file.metadata && (
                  <div className="mt-2 text-sm text-gray-500">
                    {Object.entries(file.metadata).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {!folders.length && !files.length && (
              <div className="text-center text-gray-500 py-8">
                This folder is empty
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;