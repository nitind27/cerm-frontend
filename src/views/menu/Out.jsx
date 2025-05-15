// Out.jsx
import { useState, useEffect } from 'react';
import InOutModal from '@/components/Modal/InOutModal';
import MaterialInfoModal from '@/components/Modal/MaterialInfoModal';
import Table from '@/components/Table/Table';
import DeletePopUp from '@/components/PopUp/DeletePopUp';
import { outFields } from '@/data/out-modal'; // Adjust the path as needed
import { outMainFields } from '@/data/outMainFields'; // Adjust the path as needed
import { getCategories } from '@/api/categoryApi';
import { getCustomers } from '@/api/customerApi';
import { getSubcategoriesByCategory } from '@/api/subcategoryAPI';
import { getOutData, addOutData, getMaterialInfoById, deleteOutData, updateOutData } from '@/api/outApi';
import { getDeposits } from 'api/depositAPI';
import { showErrorAlert, showSuccessAlert } from '@/utils/AlertService';
import { generateInvoice, getInvoice } from '@/api/invoiceApi';


// Different modal for Invoice 
import InvoiceModal from '@/components/Modal/InvoiceModal';




const Out = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outData, setOutData] = useState([]); // Array of OUT records
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [customersList, setCustomerList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [selectedMaterialInfo, setSelectedMaterialInfo] = useState(null); // Store fetched material info
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [rowToDelete, setRowToDelete] = useState(null);
  const IMG_URL = import.meta.env.VITE_IMG_URL;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData.map((cat) => cat.category));

        // Fetch customers
        const customerData = await getCustomers();
        setCustomerList(customerData.map((cust) => cust.name));

        // Fetch OUT data
        const outRecords = await getOutData();
        setOutData(outRecords);
        console.log('outRecord', outRecords);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchInitialData();
  }, []);

  const handleCategoryChange = async (selectedCategory) => {
    try {
      const subcategoryList = await getSubcategoriesByCategory(selectedCategory);
      setSubcategories(subcategoryList.map((subcat) => subcat.subcategory));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };
  
  const handleDepositRate = async (cat, sub) =>{
    try {
      const depositData = await getDeposits();
      // console.log('Deposit Data:', depositData);

      // Find the deposit value based on category and subcategory
      const depositEntry = depositData.find(entry =>
          entry.category.toLowerCase() === cat.toLowerCase() &&
          entry.subcategory.toLowerCase() === sub.toLowerCase()
      );

      if (depositEntry) {
          console.log(`Deposit Value for Category: ${cat}, Subcategory: ${sub} is ${depositEntry.deposit}`);
          return depositEntry.deposit;
      } else {
          console.log(`No deposit value found for Category: ${cat}, Subcategory: ${sub}`);
          return null;
      }
     } catch (error) {
      console.error('Error fetching deposit data:', error);
      return null;
    } 
  }

  const handleSubmit = async (data) => {
    console.log('Out data submitted:', data);
    console.log('Customer value:', data.customer);

    try {
      if (selectedRecord) {
        // Update existing record
        await updateOutData(selectedRecord.in_out_id, data);
        showSuccessAlert('Out data updated successfully!');
      } else {
        // Add new record
        await addOutData(data);
        showSuccessAlert('Out data added successfully!');
      }

      setIsModalOpen(false);
      setSelectedRecord(null);

      // Add a small delay to ensure the database operation is complete
      setTimeout(async () => {
        const updatedData = await getOutData();
        console.log('Updated Out data:', updatedData);
        setOutData(updatedData);
      }, 500);
    } catch (error) {
      console.error('Error submitting out data:', error);
      showErrorAlert('Error submitting out data!');
    }
  };

  const handleEditClick = async (row) => {
    console.log('Edit row data:', row);
    if (!row?.id) {
      showErrorAlert('Invalid data item selected for editing.');
      return;
    }

    try {
      const materialData = await getMaterialInfoById(row.material_info_id);

      // Extract image paths from the URLs
      const aadharPhoto = row.aadhar_photo ? row.aadhar_photo.replace(`${IMG_URL}/`, '') : '';
      const otherProof = row.other_proof ? row.other_proof.replace(`${IMG_URL}/`, '') : '';

      const newRecord = {
        in_out_id: row.id || '',
        customer: row.customer || '',
        receiver: row.receiver_name || '',
        payMode: row.payment_mode || '',
        deposit: row.deposit || '',
        aadharPhoto: aadharPhoto, // Use the extracted path
        other_proof: otherProof, // Use the extracted path
        remark: row.remark || '',
        cartItems: materialData || []
      };

      console.log('Updated selectedRecord:', newRecord);
      setSelectedRecord(newRecord);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching material info:', error);
      showErrorAlert('Failed to fetch material info');
    }
  };

  const handleDetails = async (materialInfoId) => {
    if (!materialInfoId) {
      showErrorAlert('Material Info ID is missing.');
      return;
    }

    try {
      const materialData = await getMaterialInfoById(materialInfoId);
      console.log('materialData', materialData);

      if (!materialData) {
        showErrorAlert('No material data found.');
        return;
      }

      setSelectedMaterialInfo(materialData);
      setIsMaterialModalOpen(true);
    } catch (error) {
      console.error('Error fetching material info:', error);
      showErrorAlert('Failed to fetch material info');
    }
  };

  const handleDeleteClick = (row) => {
    console.log('row', row);
    if (!row || !row.id) {
      showErrorAlert('Invalid stock item selected for deletion.');
      return;
    }
    setRowToDelete(row);
    setIsDeletePopupOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete || !rowToDelete.id) {
      showErrorAlert('Error deleting data. Invalid item selected.');
      return;
    }
    try {
      await deleteOutData(rowToDelete);
      const updatedData = await getOutData();
      setOutData(updatedData);
      setIsDeletePopupOpen(false);
      showSuccessAlert('Outdata Deleted Successfully');
    } catch (error) {
      console.error('Error deleting data:', error);
      showErrorAlert('Error deleting data');
    }
  };

  const handleViewInvoice = async (outId) => {
    try {
      const invoiceBlob = await getInvoice(outId);
      // Create a URL for the blob
      const url = window.URL.createObjectURL(invoiceBlob);
      // Open in new window
      window.open(url, '_blank');
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error viewing invoice:', error);
      showErrorAlert('Error viewing invoice');
    }
  };

  const payModes = ['Cash', 'Card', 'Online'];
  const tableHeaders = ['Customer', 'Material Info', 'Receiver Name', 'Payment Mode', 'Deposit', 'Aadhar Photo', 'Other Proof', 'Remark', 'Invoice'];

  // Map outData to table format with safety checks for undefined values
  const tableData = outData.map((record) => {
    console.log('Processing record:', record);
    console.log('Customer value:', record.customer);
    
    return {
      id: record.in_out_id,
      material_info_id: record.material_info,
      material_info: (
        <button onClick={() => handleDetails(record.material_info)} className="btn btn-outline-primary btn-sm">
          Details
        </button>
      ),
      customer: record.customer || '',
      receiver_name: record.receiver || '',
      payment_mode: record.payMode || '',
      deposit: record.deposit || 0,
      aadhar_photo: record.aadharPhoto ? `${IMG_URL}/${record.aadharPhoto}` : '',
      other_proof: record.other_proof ? `${IMG_URL}/${record.other_proof}` : '',
      remark: record.remark || '',
      invoice: (
        <button 
          onClick={() => handleViewInvoice(record.in_out_id)}
          className="btn btn-outline-primary btn-sm"
        >
          Invoice
        </button>
      )
    };
  });

  // Get dynamic fields for material (cart) and main details
  const cartFields = outFields(categories, subcategories);
  const mainFields = outMainFields(customersList, payModes);

  return (
    <>
      <Table
        onButtonClick={() => {
          setSelectedRecord(null);
          setIsModalOpen(true);
        }}
        buttonLabel="Add Out"
        tableHeaders={tableHeaders}
        tableData={tableData}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />
      {isModalOpen && (
        <InOutModal
          show={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selectedRecord}
          onSubmit={handleSubmit}
          mode="out"
          mainFields={mainFields}
          cartFields={cartFields}
          customer={customersList}
          getDepositRate={handleDepositRate}
          // getDepositRate={(cat, sub) => 10} 
          onCategoryChange={handleCategoryChange} 
        />
      )}
      {isLoading && <p>Loading...</p>} {/* Optional loading indicator */}
      {isMaterialModalOpen && selectedMaterialInfo && (
          <MaterialInfoModal
            materialData={selectedMaterialInfo}
            onClose={() => setIsMaterialModalOpen(false)}
            show={isMaterialModalOpen}
            mode="out"
          />
        )}

      {isDeletePopupOpen && (
        <DeletePopUp
          isOpen={isDeletePopupOpen}
          onClose={() => setIsDeletePopupOpen(false)}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to delete this Out data?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </>
  );
};

export default Out;
