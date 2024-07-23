import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { DataGrid } from '@mui/x-data-grid';
import 'react-datepicker/dist/react-datepicker.css';
import logoTopLeft from './Unilever-Logo.png';
import logoBottom from './company-tansparent.png';
import { FormControlLabel, Switch } from '@mui/material';
//import CustomFilterModal from './customFilterModal'; // Import the modal component
import UniqueFilterModal from './UniqueFilterModal'; // New modal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [gridData, setGridData] = useState([]);
  const [costGridData, setCostGridData] = useState([]);
  const [subscription, setSubscription] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [showAlternate, setShowAlternate] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [modalShow, setModalShow] = useState(false);
  //const [subscriptions, setSubscriptions] = useState([]); // Manage subscriptions
  const [selectedSubscription, setSelectedSubscription] = useState([]);
  const [resourceGroups, setResourceGroups] = useState({}); // Manage resource groups
  const [uniqueModalShow, setUniqueModalShow] = useState(false); // State for UniqueFilterModal
  const [refreshKey, setRefreshKey] = useState(0);
  const [filterChanged, setFilterChanged] = useState(false);
  //const [savedFilters, setSavedFilters] = useState([]);
  const [subscriptionValue, setSubscriptionValue]= useState([]);
  

  const effectRan = useRef(false);  

  // useEffect(() => {
	// if (effectRan.current === false) {
  //   axios.get('https://func-datalab-resource.azurewebsites.net/api/GetResourceGroups?code=qD0tXBMsJtmG6BdVHihMXO7v-ADh_gY_LsUb0VJ66ThAAzFuXzcUgw==')
  //     .then(response => {
  //         //alert(resourceGroups);
  //         const ResourceGroupsData = response.data;
  //         alert(JSON.stringify(ResourceGroupsData, null, 2));
  //         setResourceGroups(response.data);
  //         const oldestDate = ResourceGroupsData[0].ResourceGroups[0].OldestResourceinResourceGroup;
  //         const newestDate = ResourceGroupsData[0].ResourceGroups[0].NewestResourceinResourceGroup;
  //         setStartDate(new Date(oldestDate));
  //         setEndDate(new Date(newestDate));
  //         //setSubscription([[], ...ResourceGroupsData.map(subs => ({ value: subs.SubscriptionId, label: subs.DisplayName }))]);
  //         setSubscription(ResourceGroupsData .map(subs => ({ value: subs.SubscriptionId, label: subs.DisplayName })));
      
  //       })
  //     .catch(error => console.error('Error fetching data:', error));

  //   // Fetch filter names from JSON server and set options
  //   axios.get('http://localhost:3001/savedFilters')
  //     .then(response => {
  //       const filterOptions = response.data.map(filter => ({
  //         value: filter.filterName,
  //         label: filter.filterName
  //       }));
  //       setOptions(filterOptions);
  //     })
  //     .catch(error => console.error('Error fetching filter names:', error)); 
	//   }
	//   return () => {
  //     effectRan.current = true; // clean up for potential component remount
  //   };
	  
  // }, []);

  // const handleSubscriptonSelectChange = (selected) => {
  //   if (selected)
  //   {      
  //     setSelectedSubscription(selected);
  //     const subscriptionValue = selected.value;
  //     setOptions([{ value: 'select_all', label: 'Select All' }, ...resourceGroups.find(rg => rg.SubscriptionId === subscriptionValue).ResourceGroups.map(rg => ({ value: rg.Name, label: rg.Name }))]);      
  //   } 
  // };
  

  // const handleSelectChange = (selected) => {
  //   if (selected && selected.some(option => option.value === 'select_all')) {
  //     if (selected.length === options.length) {
  //       setSelectedOptions(options.filter(option => option.value !== 'select_all'));
  //     } else {
  //       setSelectedOptions([{ value: 'select_all', label: 'Select All' }, ...options.filter(option => option.value !== 'select_all')]);
  //     }
  //   } else {
  //     //alert('hello');
  //     setSelectedOptions(selected);
  //   }
  // };

  const handleSaveFilter = (newFilter) => {
        setFilterChanged(true); // Trigger polling    
  };

  const handleDeleteFilter = (filterName) => {
         setFilterChanged(true); // Trigger polling
  };

  useEffect(() => {
    if (filterChanged) {
      axios.get('http://localhost:3001/savedFilters')
        .then(response => {
          const filterOptions = response.data.map(filter => ({
            value: filter.filterName,
            label: filter.filterName
          }));
          setOptions(filterOptions);
          setFilterChanged(false); // Reset state after polling
        })
        .catch(error => console.error('Error fetching filter names:', error));
    }
  }, [filterChanged]);

  useEffect(() => {
    if (effectRan.current === false) {
      const fetchResourceGroups = axios.get('https://func-datalab-resource.azurewebsites.net/api/GetResourceGroups?code=qD0tXBMsJtmG6BdVHihMXO7v-ADh_gY_LsUb0VJ66ThAAzFuXzcUgw==');
      const fetchFilterNames = axios.get('http://localhost:3001/savedFilters');
  
      Promise.all([fetchResourceGroups, fetchFilterNames])
        .then(([resourceGroupsResponse, filtersResponse]) => {
          const ResourceGroupsData = resourceGroupsResponse.data;
          const filterOptions = filtersResponse.data.map(filter => ({
            value: filter.filterName,
            label: filter.filterName
          }));
  
          // Set subscription options
          setSubscription(ResourceGroupsData.map(subs => ({ value: subs.SubscriptionId, label: subs.DisplayName })));
  
          // Set resource groups and default options
          setResourceGroups(ResourceGroupsData);
          setOptions([
            { value: 'select_all', label: 'Select All' }, // Select All first
            ...filterOptions, // Filter names next
            { value: 'select_all', label: 'Select All' } // Placeholder for resource groups
          ]);
  
          // Set date range
          const oldestDate = ResourceGroupsData[0].ResourceGroups[0].OldestResourceinResourceGroup;
          const newestDate = ResourceGroupsData[0].ResourceGroups[0].NewestResourceinResourceGroup;
          //const subscription = ResourceGroupsData[0].SubscriptionId;
          //setSubscription(subscription);
          setStartDate(new Date(oldestDate));
          setEndDate(new Date(newestDate));
        })
        .catch(error => console.error('Error fetching data:', error));
    }
    return () => {
      effectRan.current = true; // Cleanup
    };
  }, []);
  
  
  const handleSubscriptonSelectChange = (selected) => {
    if (selected) {      
      setSelectedSubscription(selected);
      const subscriptionValue = selected.value;
      
      // Find resource groups for the selected subscription
      const subscriptionData = resourceGroups.find(rg => rg.SubscriptionId === subscriptionValue);
      
      if (subscriptionData) {
        // Map resource groups for the selected subscription
        const resourceGroupOptions = subscriptionData.ResourceGroups.map(rg => ({
          value: rg.Name, // Use the correct field name
          label: rg.Name  // Use the correct field name
        }));
        
        // Fetch and map filter options
        axios.get('http://localhost:3001/savedFilters')
          .then(response => {
            const filterOptions = response.data
              .filter(filter => filter.subscription.value === subscriptionValue)
              .map(filter => ({
                value: filter.filterName,
                label: filter.filterName
              }));
            
            // Merge filter options and resource group options
            setOptions([
              { value: 'select_all', label: 'Select All' }, // Select All first
            ...filterOptions,  // Filter names next
            ...resourceGroupOptions // Resource groups last
            ]);
          })
          .catch(error => console.error('Error fetching filter names:', error));      
      }
    } 
  };
  
  // const handleSelectChange = (selected) => {
  //   if (selected && selected.some(option => option.value === 'select_all')) {
  //     if (selected.length === options.length) {
  //       setSelectedOptions(options.filter(option => option.value !== 'select_all'));
  //     } else {
  //       setSelectedOptions([{ value: 'select_all', label: 'Select All' }, ...options.filter(option => option.value !== 'select_all')]);
  //     }
  //   } else {
  //     setSelectedOptions(selected);

  //     // Check if a filter name is selected
  //   if (selected && selected.length === 1 && selected[0].value !== 'select_all') {
  //     const filterName = selected[0].value;

  //     axios.get(`http://localhost:3001/savedFilters?filterName=${filterName}`)
  //       .then(response => {
  //         const filter = response.data[0];
  //         if (filter) {
  //           // Update resource groups options based on the selected filter
  //           const resourceGroupOptions = filter.resourceGroups.map(rg => ({
  //             value: rg.label, // Assuming rg.label is the resource group name
  //             label: rg.label
  //           }));

  //           // Update the options with resource groups and filter options
          
  //           // setOptions([
  //           //   { value: 'select_all', label: 'Select All' }, // Select All first
  //           //   //...resourceGroupOptions, ...(options.filter.label(option => option.value !== 'select_all'))
  //           //   ...resourceGroupOptions // Resource groups for the selected filter
  //           // ]);
            
  //           // Directly select the resource groups for the filter
  //           setSelectedOptions(resourceGroupOptions);
  //           const remainingResourceGroups = resourceGroups.flatMap(subscription =>
  //             subscription.ResourceGroups.map(rg => ({
  //               value: rg.Name,
  //               label: rg.Name
  //             }))
  //           ).filter(option => 
  //             !resourceGroupOptions.some(rg => rg.value === option.value)
  //           );

  //           axios.get('http://localhost:3001/savedFilters')
  //             .then(response => {
  //               const remainingFilters = response.data
  //                 .filter(filter => filter.filterName !== filterName)
  //                 .map(filter => ({
  //                   value: filter.filterName,
  //                   label: filter.filterName
  //                 }));

           
  //           setOptions([
  //             { value: 'select_all', label: 'Select All' },
  //             ...remainingFilters,
  //             ...resourceGroupOptions,
  //             ...remainingResourceGroups 
  //           ]);
  //       })
  //       .catch(error => console.error('Error fetching remaining filter names:', error));
  //     }
  //     })
  //     .catch(error => console.error('Error fetching filter data:', error));
  //   } else {
  //      setOptions([
  //         { value: 'select_all', label: 'Select All' },
  //         ...options.filter(option => option.value !== 'select_all')
  //        ]);
  //    }
  //   }
  // };
  
  // const handleSelectChange = (selected) => {
  //   if (selected && selected.some(option => option.value === 'select_all')) {
  //     if (selected.length === options.length) {
  //       setSelectedOptions(options.filter(option => option.value !== 'select_all'));
  //     } else {
  //       setSelectedOptions([{ value: 'select_all', label: 'Select All' }, ...options.filter(option => option.value !== 'select_all')]);
  //     }
  //   } else {
  //     //setSelectedOptions(selected);

  //     // Define filterNames from the current options (assuming filter names have specific criteria to differentiate them)
  //   const filterNames = options.map(option => option.value).filter(value => value.startsWith('filter'));


  //     // Filter out the selected options that are filter names
  //   const selectedResourceGroups = selected.filter(option => !filterNames.includes(option.value));

  //   // Set the selected options state without filter names
  //   setSelectedOptions(selectedResourceGroups);
  
  //     // Check if filter names are selected
  //     if (selected && selected.some(option => option.value !== 'select_all')) {
  //       const filterNamesSelected = selected.filter(option => option.value !== 'select_all').map(option => option.value);
  
  //       // Fetch data for the selected filters
  //       axios.get('http://localhost:3001/savedFilters')
  //         .then(response => {
  //           const filters = response.data.filter(filter => filterNamesSelected.includes(filter.filterName));
  //           if (filters.length > 0) {
  //             // Merge resource groups of the selected filters
  //             const resourceGroupOptions = filters.flatMap(filter =>
  //               filter.resourceGroups.map(rg => ({
  //                 value: rg.label, // Assuming rg.label is the resource group name
  //                 label: rg.label
  //               }))
  //             );
  
  //             // Remove duplicate resource groups
  //             const uniqueResourceGroupOptions = resourceGroupOptions.filter((option, index, self) =>
  //               index === self.findIndex(rg => rg.value === option.value)
  //             );
  
  //             // Find remaining resource groups that are not part of the selected filters
  //             const remainingResourceGroups = resourceGroups.flatMap(subscription =>
  //               subscription.ResourceGroups.map(rg => ({
  //                 value: rg.Name,
  //                 label: rg.Name
  //               }))
  //             ).filter(option => 
  //               !uniqueResourceGroupOptions.some(rg => rg.value === option.value)
  //             );
  
  //             // Find remaining filters that are not part of the selected filters
  //             const remainingFilters = response.data
  //               .filter(filter => !filterNamesSelected.includes(filter.filterName))
  //               .map(filter => ({
  //                 value: filter.filterName,
  //                 label: filter.filterName
  //               }));
  
  //             // Update the options with the merged resource groups and remaining filters
  //             setOptions([
  //               { value: 'select_all', label: 'Select All' },
  //               ...remainingFilters,
  //               ...uniqueResourceGroupOptions,
  //               ...remainingResourceGroups 
  //             ]);
  
  //             // Directly select the resource groups for the selected filters
  //             setSelectedOptions([
  //               ...selectedResourceGroups,
  //               ...uniqueResourceGroupOptions.filter(rg => !selectedResourceGroups.some(sel => sel.value === rg.value))
  //             ]);
  //           //setSelectedOptions(uniqueResourceGroupOptions);
  //           }
  //         })
  //         .catch(error => console.error('Error fetching filter data:', error));
  //     } else {
  //       setOptions([
  //         { value: 'select_all', label: 'Select All' },
  //         ...options.filter(option => option.value !== 'select_all')
  //       ]);
  //     }
  //   }
  // };

  const handleSelectChange = (selected) => {
    if (selected && selected.some(option => option.value === 'select_all')) {
      if (selected.length === options.length) {
        setSelectedOptions(options.filter(option => option.value !== 'select_all'));
      } else {
        setSelectedOptions([{ value: 'select_all', label: 'Select All' }, ...options.filter(option => option.value !== 'select_all')]);
      }
    } else {
      // Fetch all filters from your server
      axios.get('http://localhost:3001/savedFilters')
        .then(response => {
          // Get all filter names
          const filterNames = response.data.map(filter => filter.filterName);
          
          // Filter out the selected options that are filter names
          const selectedResourceGroups = selected.filter(option => !filterNames.includes(option.value));
          
          // Set the selected options state without filter names
          setSelectedOptions(selectedResourceGroups);
  
          // Check if filter names are selected
          if (selected && selected.some(option => option.value !== 'select_all')) {
            const filterNamesSelected = selected.filter(option => option.value !== 'select_all').map(option => option.value);
  
            // Fetch data for the selected filters
            const filters = response.data.filter(filter => filterNamesSelected.includes(filter.filterName));
            if (filters.length > 0) {
              // Merge resource groups of the selected filters
              const resourceGroupOptions = filters.flatMap(filter =>
                filter.resourceGroups.map(rg => ({
                  value: rg.label, // Assuming rg.label is the resource group name
                  label: rg.label
                }))
              );
  
              // Remove duplicate resource groups
              const uniqueResourceGroupOptions = resourceGroupOptions.filter((option, index, self) =>
                index === self.findIndex(rg => rg.value === option.value)
              );
              
  
              // Find remaining resource groups that are not part of the selected filters
              const remainingResourceGroups = resourceGroups.flatMap(subscription =>
                subscription.ResourceGroups.map(rg => ({
                  value: rg.Name,
                  label: rg.Name
                }))
              ).filter(option => 
                !uniqueResourceGroupOptions.some(rg => rg.value === option.value)
              );
  
              // Find remaining filters that are not part of the selected filters
              const remainingFilters = response.data
                .filter(filter => !filterNamesSelected.includes(filter.filterName))
                .map(filter => ({
                  value: filter.filterName,
                  label: filter.filterName
                }));
  
              // Update the options with the merged resource groups and remaining filters
              setOptions([
                { value: 'select_all', label: 'Select All' },
                ...remainingFilters,
                ...uniqueResourceGroupOptions,
                ...remainingResourceGroups 
              ]);
  
              // Directly select the resource groups for the selected filters
              setSelectedOptions([
                ...selectedResourceGroups,
                ...uniqueResourceGroupOptions.filter(rg => !selectedResourceGroups.some(sel => sel.value === rg.value))
              ]);
            }
          } else {
            setOptions([
              { value: 'select_all', label: 'Select All' },
              ...options.filter(option => option.value !== 'select_all')
            ]);
          }
        })
        .catch(error => console.error('Error fetching filter data:', error));
    }
  };
  
  

  const handleCostButtonClick = () => {
    const selectedItems = selectedOptions.map(option => option.value).filter(value => value !== 'select_all').join(',');
    console.log('Selected Items:', selectedItems); // Log selected items
  
    setLoading(true);
  
    if (showAlternate) {
      axios.get('https://func-datalab-resource.azurewebsites.net/api/GetResourceCost?code=qD0tXBMsJtmG6BdVHihMXO7v-ADh_gY_LsUb0VJ66ThAAzFuXzcUgw==', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          resourceGroupNames: selectedItems,
          subscriptionId: selectedSubscription.value
        }
      })
      .then(response => {
        console.log('Cost Data Response:', response.data); // Log the data
        const formattedData = response.data.map((resourceData, index) => ({
          id: index,
          resourceGroupName: resourceData.resourceGroupName,
          name: resourceData.name,
          type: resourceData.type,
          createdTime: resourceData.createdTime,
          totalCost: resourceData.totalCost,
          location: resourceData.location,
          currency: resourceData.currency
        }));
  
        setCostGridData(formattedData);
  
        const total = response.data.reduce((accumulator, item) => accumulator + item.totalCost, 0);
        setTotalCost(total.toFixed(2)); // Ensure total is formatted correctly
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching grid data:', error);
        setLoading(false);
      });
    } else {
      axios.get('https://func-datalab-resource.azurewebsites.net/api/GetResource?code=qD0tXBMsJtmG6BdVHihMXO7v-ADh_gY_LsUb0VJ66ThAAzFuXzcUgw==', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          resourceGroupNames: selectedItems,
          subscriptionIds: selectedSubscription.value
        }
      })
      .then(response => {
        console.log('Resource Data Response:', response.data); // Log the data
        const formattedData = response.data.map((resourceData, index) => ({
          id: index,
          resourceGroupName: resourceData.resourceGroupName,
          name: resourceData.name,
          type: resourceData.type,
          createdTime: resourceData.createdTime,
          location: resourceData.location,
          resourceId:resourceData.id
        }));
  
        setGridData(formattedData);
        setTotalCost(formattedData.length);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching grid data:', error);
        setLoading(false);
      });
    }
  };
  
  const handleToggleChange = (event) => {
    setShowAlternate(event.target.checked);
    setGridData([]);
    setCostGridData([]);
    setTotalCost(0);
  };

  const handleUniqueModalOpen = () => {
    setUniqueModalShow(true);

  };
  const handleCloseModal = () => {
    setUniqueModalShow(false);
    setRefreshKey(prevKey => prevKey + 1); 
  };

  
 const costColumns = [
    { field: 'resourceGroupName', headerName: 'RG Name', width: 250 },
    { field: 'name', headerName: 'Service Name', width: 350 },
    { field: 'type', headerName: 'Service Type', width: 300 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'createdTime', headerName: 'Created Time', width: 250 },
    { field: 'totalCost', headerName: 'Cost', width: 500 }
  ];

  const resourceColumns = [
    { field: 'resourceGroupName', headerName: 'RG Name', width: 250 },
    { field: 'name', headerName: 'Service Name', width: 350 },
    { field: 'type', headerName: 'Service Type', width: 300 },
    { field: 'location', headerName: 'Location', width: 200 },
    { field: 'createdTime', headerName: 'Created Time', width: 250 },
    { field: 'resourceId', headerName: 'Resource Id', width: 500 }
  ];
  const buttonStyle = {
    border: 'none',
    outline: 'none', // Remove default outline
    cursor: 'pointer', // Add cursor pointer for better UX
  };

  return (
   <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '10px', overflow: 'hidden' }}>
      <img src={logoTopLeft} alt="Logo" style={{ position: 'absolute', top: '10px', left: '10px', width: '60px', height: 'auto', zIndex: '100' }} />
      <div className="row text-center my-2" style={{ color: "royalblue" }}>
        <h4>e-Science Resource Data</h4>
      </div>
          <div className="row bg-light" style={{ padding: '5px', borderRadius: '4px' }}>
            <div className="col-8 col-md-8">
                <div className="row">
                  <div className="col-6 col-md-4">
                  <label htmlFor="startDate"><h6>Start Date:</h6></label>
                      <DatePicker
                        selected={startDate}
                        onChange={date => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control form-control-sm"
                      />
            </div>
            <div className="col-6 col-md-4">
              <label htmlFor="endDate"><h6>End Date:</h6></label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="form-control form-control-sm"
              />
            </div>
            <div className="col-8 col-md-4"> 
                  <FormControlLabel
                      control={<Switch checked={showAlternate} onChange={handleToggleChange} />}
                      label="Toggle Cost View"
                    />
                  </div>
                </div>
                {/* <div class="row">
                  <div class="col-6">.col-6</div>
                  <div class="col-6">.col-6</div>
                </div> */}
            </div>
            <div className="col-4 col-md-4" >
              <div className="row">
                <div className="col-4 col-md-2" >
                    <label htmlFor="totalCost"><h6>Total:</h6></label>                    
                </div>
                <div className="col-8 col-md-6 " >
                    <div className="bg-info text-white text-center" style={{ height: '5vh',  borderRadius: '4px' }}>
                      <h6>{totalCost}</h6>
                    </div>  
                </div>
              </div>
            </div>
          </div>
          {/* Search List */}


     <div className="row bg-light align-items-end" style={{ padding: '5px', borderRadius: '4px' }}>
            <div className="col-8 col-md-8">
                {/* ##################### */}
                    
                <div className="row">  
                  <div className="col-2 col-md-4">   
                        <label htmlFor="selectSubs"><h6>Select Subscription:</h6></label>
                      </div>  
                      <div className="col-10 col-md-8">
                          <Select
                            className="form-control-sm"
                            id="selectSubs"                            
                            options={subscription}
              value={selectedSubscription}
                            onChange={handleSubscriptonSelectChange}
                           
                            styles={{
                              control: (provided) => ({ ...provided, maxHeight: '40px', overflowY: 'auto' }),
                              menu: (provided) => ({ ...provided, maxHeight: '200px', overflowY: 'auto' })
                            }}
                          />
                  </div>
                </div>

                {/* ##################### */}

          <div className="row">
            <div className="col-2 col-md-2">
              <label htmlFor="selectItems"><h6>Select Items:</h6></label>
            </div>
            <div className="col-10 col-md-10">
            <Select
  className="form-control-sm"
  id="selectItems"
  isMulti
  value={selectedOptions}
  onChange={handleSelectChange}
  options={options}
  styles={{
    control: (provided) => ({ ...provided, maxHeight: '40px', overflowY: 'auto' }),
    menu: (provided) => ({ ...provided, maxHeight: '200px', overflowY: 'auto' })
  }}
/>
            </div>
          </div>
        </div>
        <div className="col-4 col-md-4" style={{ padding: '5px' }}>
          <button onClick={handleCostButtonClick} className="btn btn-primary btn-sm btn-space">Get Filter Data</button>
          <button onClick={handleUniqueModalOpen} className="btn btn-sm no-outline"style={buttonStyle} ><FontAwesomeIcon icon={faFilter} /></button>
        </div>
      </div>

      <div style={{ flex: '1 1 auto', overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : showAlternate ? (
          <DataGrid
            rows={costGridData}
            columns={costColumns}
            pageSize={5}
            className="data-grid-custom table"
            style={{ height: '100%' }}
          />
        ) : (
          <DataGrid
            rows={gridData}
            columns={resourceColumns}
            pageSize={5}
            className="data-grid-custom table"
            style={{ height: '100%' }}
          />
        )}
      </div>

      <div style={{ bottom: '10px', right: '20px', textAlign: 'right', fontSize: '0.8em' }}>
        <p style={{ margin: 0, color: "black" }}>Powered by Confluentis Consulting <img src={logoBottom} alt="ConfluentisLogo" style={{ width: '20px', height: 'auto', verticalAlign: 'middle', marginLeft: '5px' }} /></p>
      </div>

      {/* Render UniqueFilterModal */}
      {uniqueModalShow && (
         <UniqueFilterModal
         show={uniqueModalShow}
         onHide={handleCloseModal}
         startDate={startDate}
         endDate={endDate}
         ResourceGroupsData={resourceGroups} 
         onSaveFilter={handleSaveFilter} 
         onDeleteFilter={handleDeleteFilter}
       />
      )}
     

    </div>
  );
};

export default App;
