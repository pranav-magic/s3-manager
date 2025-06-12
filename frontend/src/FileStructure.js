import React from 'react';
import Folder from './Folder';

const FileStructure = ({ structure, fetchStructure }) => {
  return (
    <div className="mt-8">
      <div className="grid grid-cols-3 gap-6">
        {structure.folders.map((folder) => (
          <Folder key={folder} folderName={folder} fetchStructure={fetchStructure} />
        ))}
        {structure.files.map((file) => (
          <div key={file} className="border p-4 rounded shadow-lg">
            <p>{file}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileStructure;
