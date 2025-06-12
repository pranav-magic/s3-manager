import React, { useState } from 'react';

const Modal = ({ modalType, setShowModal, fetchStructure }) => {
  const [folderName, setFolderName] = useState('');

  const handleCreate = async () => {
    if (modalType === 'createFolder') {
      await fetch('http://localhost:5000/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_name: folderName }),
      });
      fetchStructure();
      setShowModal(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Create a New Folder</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder Name"
          className="border p-2 w-full mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
