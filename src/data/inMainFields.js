export const inMainFields = (customers, payModes) => [
  // {
  //   name: 'customer',
  //   label: 'Customer Name',
  //   type: 'select',
  //   options: customers, 
  //   placeholder: 'Select Customer',
  //   width: 4,
  // },
  {
    name: 'receiver',
    label: 'Receiver Name',
    type: 'text',
    placeholder: 'Receiver Name',
    width: 4,
  },
  {
    name: 'aadharPhoto',
    label: 'Aadhar Photo',
    type: 'file',
    width: 4,
  },
  {
    name: 'other_proof',
    label: 'Other Proof',
    type: 'file',
    width: 4,
  },
  {
    name: 'payMode',
    label: 'Payment Mode',
    type: 'select',
    options: payModes, 
    placeholder: 'Select Payment Mode',
    width: 4,
  },
  {
    name: 'totalAmount',
    label: 'Total Amount',
    type: 'text',
    readOnly: true,
    width: 4,
  },
  {
    name: 'depositReturn',
    label: 'Deposit Return',
    type: 'text',
    readOnly: true,
    width: 4,
  },
  
  {
    name: 'remark',
    label: 'Remark',
    type: 'textarea',
    placeholder: 'Enter remarks...',
    width: 12,
  },
];
