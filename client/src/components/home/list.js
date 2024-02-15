import React, { useEffect, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Button } from '@material-ui/core';
import axios from 'axios';
import Swal from 'sweetalert2';

function List() {
    const [isLoading, setIsLoading] = useState(true);
    const [listData, setListData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/getList');
                setListData(response.data.data);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCheckboxChange = (id) => {
        const selectedIndex = selectedIds.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedIds, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedIds.slice(1));
        } else if (selectedIndex === selectedIds.length - 1) {
            newSelected = newSelected.concat(selectedIds.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedIds.slice(0, selectedIndex),
                selectedIds.slice(selectedIndex + 1)
            );
        }

        setSelectedIds(newSelected);
    };

    const isSelected = (id) => selectedIds.indexOf(id) !== -1;

    const handleDelete = async () => {
        if (selectedIds.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please select at least one item to delete!',
            });
            return;
        }
    
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete the selected items?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setIsDeleting(true);
                    await Promise.all(selectedIds.map(async (id) => {
                        await axios.post(`http://localhost:8000/api/delete`, { id: id });
                    }));
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Items deleted successfully!',
                    });
                    // Clear the selectedIds array
                    setSelectedIds([]);
                    setIsDeleting(false);
                    // Refetch the list data
                    const response = await axios.get('http://localhost:8000/api/getList');
                    setListData(response.data.data);
                } catch (error) {
                    console.error('Error deleting items:', error);
                    setIsDeleting(false);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete items!',
                    });
                }
            }
        });
    };
    

    const handleDetailsClick = async (id) => {
        try {
            const response = await axios.get(`http://localhost:8000/api/getById?id=${id}`);
            const files = response.data.data.files;
    
            // Extract file names from URLs
            const fileNames = files.map(file => file.split('/').pop()); // Extract the last part of the URL (file name)
    
            // Create an HTML string with links to all files
            const htmlContent = fileNames.map(fileName => `<a href="http://localhost:8000/uploads/${fileName}" target="_blank">${fileName}</a>`).join('<br>');
    
            // Create a new tab with the HTML content
            const newTab = window.open();
            newTab.document.write(htmlContent);
            newTab.document.close();
        } catch (error) {
            console.error('Error fetching details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch details!',
            });
        }
    };    
    

    return (
        <div>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <div>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDelete}
                        disabled={selectedIds.length === 0 || isDeleting}
                    >
                        Delete
                    </Button>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Select</TableCell>
                                    <TableCell>Step</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {listData.map((item, index) => {
                                    const isItemSelected = isSelected(item.id);
                                    return (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={isItemSelected}
                                                    onChange={() => handleCheckboxChange(item.id)}
                                                />
                                            </TableCell>
                                            <TableCell>{item.step}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleDetailsClick(item.id)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )}
        </div>
    );
}

export default List;
