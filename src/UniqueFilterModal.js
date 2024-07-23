import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaEdit } from 'react-icons/fa'; // Import the edit icon from react-icons

const UniqueFilterModal = ({ show, onHide, startDate, endDate, ResourceGroupsData, onSaveFilter, onDeleteFilter }) => {
  const [filterName, setFilterName] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [resourceGroups, setResourceGroups] = useState([]);
  const [selectedResourceGroups, setSelectedResourceGroups] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const [editingFilterId, setEditingFilterId] = useState(null); // New state for tracking the filter being edited

  useEffect(() => {
    if (show) {
      const subscriptionOptions = ResourceGroupsData.map(subs => ({
        value: subs.SubscriptionId,
        label: subs.DisplayName
      }));

      const resourceGroupOptions = ResourceGroupsData.flatMap(subs =>
        subs.ResourceGroups.map(rg => ({
          value: rg.Name,
          label: rg.Name
        }))
      );

      setSubscriptions(subscriptionOptions);
      setResourceGroups(resourceGroupOptions);
    }
  }, [show, ResourceGroupsData]);

  useEffect(() => {
    axios.get('http://localhost:3001/savedFilters')
      .then(response => {
        setSavedFilters(response.data);
      })
      .catch(error => {
        console.error('Error fetching saved filters:', error);
      });
  }, []);

  const saveFilterToServer = (filterData) => {
    axios.post('http://localhost:3001/savedFilters', filterData)
      .then(response => {
        setSavedFilters([...savedFilters, response.data]);
        console.log('Filter saved successfully:', response.data);
      })
      .catch(error => {
        console.error('Error saving filter:', error);
      });
  };

  const updateFilterOnServer = (filterData) => {
    axios.put(`http://localhost:3001/savedFilters/${editingFilterId}`, filterData)
      .then(response => {
        const updatedFilters = savedFilters.map(filter => 
          filter.id === editingFilterId ? response.data : filter
        );
        setSavedFilters(updatedFilters);
        console.log('Filter updated successfully:', response.data);
      })
      .catch(error => {
        console.error('Error updating filter:', error);
      });
  };

  const handleSaveFilter = () => {
    if (!filterName) {
      alert('Filter Name is required');
      return;
    }
    if (!selectedSubscription) {
      alert('Subscription is required');
      return;
    }
    if (selectedResourceGroups.length === 0) {
      alert('At least one Resource Group is required');
      return;
    }

    const filterData = {
      filterName: filterName,
      subscription: selectedSubscription,
      resourceGroups: selectedResourceGroups
    };

    if (editingFilterId) {
      updateFilterOnServer(filterData);
    } else {
      saveFilterToServer(filterData);
    }

    onSaveFilter(filterData);
    clearForm();
  };

  const clearForm = () => {
    setFilterName('');
    setSelectedSubscription(null);
    setSelectedResourceGroups([]);
    setEditingFilterId(null);
  };

  const handleEditFilter = (filter) => {
    setFilterName(filter.filterName);
    setSelectedSubscription(filter.subscription);
    setSelectedResourceGroups(filter.resourceGroups);
    setEditingFilterId(filter.id);
  };

  const handleSubscriptionChange = (selectedOption) => {
    setSelectedSubscription(selectedOption);

    const filteredResourceGroups = ResourceGroupsData
      .find(sub => sub.SubscriptionId === selectedOption.value)
      .ResourceGroups.map(group => ({
        value: group.Name,
        label: group.Name
      }));

    setResourceGroups(filteredResourceGroups);
  };

  const handleResourceGroupsChange = (selectedOptions) => {
    setSelectedResourceGroups(selectedOptions);
  };

  const handleRemoveFilter = (id) => {
    axios.delete(`http://localhost:3001/savedFilters/${id}`)
      .then(() => {
        const updatedFilters = savedFilters.filter(filter => filter.id !== id);
        setSavedFilters(updatedFilters);
        onDeleteFilter(id);
        console.log('Filter deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting filter:', error);
      });
  };

  return (
    <div className={`modal ${show ? 'show' : ''}`} style={{ display: show ? 'block' : 'none', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: '1050' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Set Unique Filter</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => { onHide(); clearForm(); }}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="filterName" className="form-label">Filter Name:</label>
              <input type="text" className="form-control" id="filterName" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="subscription" className="form-label">Select Subscription:</label>
              <Select
                id="subscription"
                value={selectedSubscription}
                onChange={handleSubscriptionChange}
                options={subscriptions}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="resourceGroups" className="form-label">Select Resource Groups:</label>
              <Select
                id="resourceGroups"
                isMulti
                value={selectedResourceGroups}
                onChange={handleResourceGroupsChange}
                options={resourceGroups}
              />
            </div>
          </div>
          {savedFilters.length > 0 && (
            <div className="modal-body">
              <h5>Saved Filters:</h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Filter Name</th>
                    <th>Subscription</th>
                    <th>Resource Groups</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedFilters.map(filter => (
                    <tr key={filter.id}>
                      <td>{filter.filterName}</td>
                      <td>{filter.subscription ? filter.subscription.label : ''}</td>
                      <td>{filter.resourceGroups ? filter.resourceGroups.map(rg => rg.label).join(', ') : ''}</td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveFilter(filter.id)}>x</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEditFilter(filter)}><FaEdit /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={handleSaveFilter}>Save Filter</button>
            <button type="button" className="btn btn-success" onClick={() => { handleSaveFilter(); onHide(); }}>Save & Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueFilterModal;
