import React, { useRef } from 'react';
import './upload.css'

const Upload = ({ onUpload }) => {
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        onUpload(file);
        fileInputRef.current.value = '';
    };

    return (
        <div>
            <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                ref={fileInputRef}
            />
            <button id='uploadButton' onClick={() => fileInputRef.current.click()}>Upload File</button>
        </div>
    );
};

export default Upload;
