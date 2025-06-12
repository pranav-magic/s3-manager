import React from 'react';

const Folder = ({ folderName, fetchStructure }) => {
  const handleDelete = async () => {
    await fetch('http://localhost:5000/api/folder', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_name: folderName }),
    });
    fetchStructure();
  };

  return (
    <div className="border p-4 rounded shadow-lg">
      <p>{folderName}</p>
      <button onClick={handleDelete} className="bg-red-500 text-white px-2 py-1 rounded mt-2">
        Delete
      </button>
    </div>
  );
};

export default Folder;
