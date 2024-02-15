import React, { useState } from 'react';
import TextEditor from '../textEditor/textEditor';
import Upload from '../uploadComponent/upload';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import './create.css';


function Create() {
    const navigate = useNavigate();
    const [stepValue, setStepValue] = useState('');
    const [nameValue, setNameValue] = useState('');
    const [steps, setSteps] = useState([]);
    const [warningMessage, setWarningMessage] = useState('');
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);

    // Function to handle adding a step
    const handleAddStep = () => {

        if (!stepValue.trim() && !nameValue.trim()) {
            setWarningMessage('Both Step and Name cannot be empty!');
            return;
        } else if (!stepValue.trim()) {
            setWarningMessage('Step cannot be empty!');
            return;
        } else if (!nameValue.trim()) {
            setWarningMessage('Name cannot be empty!');
            return;
        }

        const newStep = {
            step: `Step: ${stepValue + (steps.length + 1)}`,
            name: nameValue,
            textEditorValue: '',
            uploadedDoc: null,
            showTextEditor: true,
            showUpload: true
        };
        setSteps([...steps, newStep]);
        setWarningMessage('');
    };

    const handleRemoveStep = (index) => {
        const updatedSteps = [...steps];
        updatedSteps.splice(index, 1);
        setSteps(updatedSteps);
    };

    const handleTextEditorChange = (index, value) => {
        const updatedSteps = [...steps];
        updatedSteps[index].textEditorValue = value;
        updatedSteps[index].showUpload = !value.trim();
        setSteps(updatedSteps);
    };

    const handleUpload = (index, file) => {
        const updatedSteps = [...steps];
        updatedSteps[index].uploadedDoc = file;
        updatedSteps[index].showTextEditor = !file;
        setSteps(updatedSteps);

        const formData = new FormData();
        updatedSteps.forEach((step, index) => {
            if (step.uploadedDoc) {
                formData.append('files', step.uploadedDoc);
            }
        });

    };


    const handleClearConfirmation = () => {
        setShowClearConfirmation(true);
    };

    const handleClearCancel = () => {
        setShowClearConfirmation(false);
    };

    const handleClearConfirm = () => {
        setSteps([]);
        setStepValue('');
        setNameValue('');
        setShowClearConfirmation(false);
    };

    const handleApiRequest = async () => {
        const formData = new FormData();
        const finalData = {
            textEditorValue: [],
            step: '',
            name: '',
        };

        steps.forEach((step, index) => {
            if (step.uploadedDoc) {
                formData.append('files', step.uploadedDoc);
            }

            finalData.step += `${step.step.replace('Step: ', '')}, `;
            finalData.name += `${step.name}, `;
            finalData.textEditorValue.push(step.textEditorValue || '');
        });

        finalData.step = finalData.step.trim().replace(/, $/, '');
        finalData.name = finalData.name.trim().replace(/, $/, '');

        // Append finalData as a part of formData
        formData.append('finalData', JSON.stringify(finalData));

        // Make your API request using formData
        try {
            await axios.post('http://localhost:8000/api/create', formData);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Data submitted successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            // Use navigate function to redirect to the list page
            navigate('/list');
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit data!',
            });
        }
    };


    return (
        <div className="container">
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Step"
                    value={stepValue}
                    onChange={(e) => setStepValue(e.target.value)}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder="Name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="input-field"
                />
                <button onClick={handleAddStep} className="add-button">+</button>
            </div>
            {warningMessage && <div className="warning-message">{warningMessage}</div>}
            <div>
                {steps.map((step, index) => (
                    <div key={index} className="step-container">
                        <div className="step-info">
                            <div className="label">{step.step}</div>
                            <div className="label">Name: {step.name}</div>
                        </div>
                        <div className="step-actions">
                            {step.showTextEditor && <TextEditor value={step.textEditorValue} onChange={(value) => handleTextEditorChange(index, value)} />}
                            {step.showTextEditor && step.showUpload && <span className="or-label">(or)</span>}
                            {step.showUpload && <Upload onUpload={(file) => handleUpload(index, file)} />}
                            <button onClick={() => handleRemoveStep(index)} className="remove-button">Remove</button>
                        </div>
                    </div>
                ))}
            </div>
            {steps.length > 0 && (
                <>
                    <button onClick={handleApiRequest} className="submit-button">Submit</button>
                    <button onClick={handleClearConfirmation} className="clear-button">Clear</button>
                </>
            )}
            {showClearConfirmation && (
                <div className="confirmation-modal">
                    <p>Are you sure you want to clear all steps?</p>
                    <button onClick={handleClearConfirm} className="submit-button">Yes</button>
                    <button onClick={handleClearCancel} className="clear-button">No</button>
                </div>
            )}
        </div>
    );
}

export default Create;
