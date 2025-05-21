import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, Save } from 'lucide-react';
import { Checklist, ChecklistItem } from '../../types/checklist';
import { getClaimChecklists, createChecklist, createChecklistItem, updateChecklistItem } from '../../services/checklistService';

interface ChecklistSectionProps {
  claimId: string;
  isEditing: boolean;
}

const CHECKLIST_TEMPLATES = {
  'installation': [
    { title: 'Installation date verified', description: 'Verify the installation date matches documentation' },
    { title: 'Installer information complete', description: 'Check if installer name and contact details are provided' },
    { title: 'Installation images uploaded', description: 'Confirm that relevant installation photos are attached' },
    { title: 'Substrate preparation documented', description: 'Verify substrate preparation meets requirements' },
    { title: 'G1S properly fastened', description: 'Check if G1S meets CRI requirements' },
    { title: 'Installation instructions followed', description: 'Verify compliance with installation guidelines' },
    { title: 'Edge treatment verified', description: 'Check if edges are properly trimmed' },
    { title: 'Proper tools used', description: 'Confirm use of porcupine roller and other required tools' },
    { title: 'HR test completed', description: 'Verify humidity resistance test results' },
    { title: 'Acclimation period observed', description: 'Confirm 24h rest before install/roll-back' },
    { title: 'Approved adhesive used', description: 'Verify glue is certified by Venture or CRI' }
  ],
  'warranty': [
    { title: 'Purchase documentation', description: 'Verify original purchase documentation is available' },
    { title: 'Warranty coverage period', description: 'Check if claim is within warranty period' },
    { title: 'Installation compliance', description: 'Verify installation meets warranty requirements' },
    { title: 'Maintenance records', description: 'Check if proper maintenance has been documented' },
    { title: 'Exclusions review', description: 'Review warranty exclusions and limitations' }
  ],
  'maintenance': [
    { title: 'Regular cleaning schedule', description: 'Verify regular cleaning has been performed' },
    { title: 'Approved cleaning methods', description: 'Check if appropriate cleaning methods were used' },
    { title: 'Cleaning products verification', description: 'Confirm use of approved cleaning products' },
    { title: 'Maintenance documentation', description: 'Review maintenance logs and records' },
    { title: 'Special conditions noted', description: 'Document any special maintenance requirements' }
  ]
};

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ claimId, isEditing }) => {
  const [checklists, setChecklists] = useState<(Checklist & { items: ChecklistItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('installation');

  useEffect(() => {
    fetchChecklists();
  }, [claimId]);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const data = await getClaimChecklists(claimId);
      setChecklists(data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChecklist = async () => {
    try {
      const newChecklist = await createChecklist({
        claim_id: claimId,
        type: selectedTemplate,
        status: 'pending'
      });

      // Add template items
      const templateItems = CHECKLIST_TEMPLATES[selectedTemplate as keyof typeof CHECKLIST_TEMPLATES];
      for (const item of templateItems) {
        await createChecklistItem({
          checklist_id: newChecklist.id,
          title: item.title,
          description: item.description,
          is_completed: false
        });
      }

      fetchChecklists();
    } catch (error) {
      console.error('Error adding checklist:', error);
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    if (!isEditing) return;

    try {
      await updateChecklistItem(item.id, {
        is_completed: !item.is_completed,
        completed_at: !item.is_completed ? new Date().toISOString() : null
      });
      fetchChecklists();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-100 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      {isEditing && (
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
          >
            <option value="installation">Installation Checklist</option>
            <option value="warranty">Warranty Checklist</option>
            <option value="maintenance">Maintenance Checklist</option>
          </select>
          <button
            onClick={handleAddChecklist}
            className="flex items-center px-3 py-2 bg-corporate-secondary text-white rounded-md hover:bg-corporate-accent transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Add Checklist
          </button>
        </div>
      )}

      {checklists.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No checklists added yet.</p>
          {isEditing && (
            <p className="text-sm text-gray-400 mt-1">
              Select a template and click "Add Checklist" to get started.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium capitalize">
                    {checklist.type} Checklist
                  </h4>
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{checklist.status}</span>
                  </p>
                </div>
                {isEditing && (
                  <button className="text-red-600 hover:text-red-800 transition-colors">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <div className="p-4">
                <div className="space-y-4">
                  {checklist.items?.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                        item.is_completed ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item)}
                        disabled={!isEditing}
                        className={`flex-shrink-0 mt-0.5 ${
                          isEditing ? 'cursor-pointer' : 'cursor-not-allowed'
                        }`}
                      >
                        {item.is_completed ? (
                          <CheckSquare size={20} className="text-green-600" />
                        ) : (
                          <Square size={20} className="text-gray-400" />
                        )}
                      </button>
                      <div>
                        <p className={`font-medium ${
                          item.is_completed ? 'text-green-800' : 'text-gray-900'
                        }`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.value && (
                          <p className="text-sm font-medium text-gray-700 mt-1">
                            Value: {item.value}
                          </p>
                        )}
                        {item.completed_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            Completed on {new Date(item.completed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChecklistSection;