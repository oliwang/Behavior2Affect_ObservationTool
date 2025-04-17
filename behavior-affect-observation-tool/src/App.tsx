import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface LogEntry {
  timestamp: number;
  timeSinceStart: string;
  label: string;
}

interface Label {
  id: string;
  text: string;
  category: string;
  subcategory?: string;
}

interface CategoryGroup {
  name: string;
  subcategories?: {[key: string]: Label[]};
  labels?: Label[];
}

function App() {
  // Countdown state
  const [duration, setDuration] = useState<number>(5); // Default 5 minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Labels state
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabel, setNewLabel] = useState<string>('');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    'Emotion': true,
    'Behavior': true
  });
  
  // Log state
  const [log, setLog] = useState<LogEntry[]>([]);
  const [logText, setLogText] = useState<string>('');

  // Load default labels
  useEffect(() => {
    const defaultLabels = [
      // Emotion - Positive
      { id: '1', text: 'Enjoyment', category: 'Emotion', subcategory: 'Positive' },
      { id: '2', text: 'Hope', category: 'Emotion', subcategory: 'Positive' },
      { id: '3', text: 'Pride', category: 'Emotion', subcategory: 'Positive' },
      { id: '4', text: 'Relief', category: 'Emotion', subcategory: 'Positive' },
      // Emotion - Negative
      { id: '5', text: 'Anger', category: 'Emotion', subcategory: 'Negative' },
      { id: '6', text: 'Anxiety', category: 'Emotion', subcategory: 'Negative' },
      { id: '7', text: 'Hopelessness', category: 'Emotion', subcategory: 'Negative' },
      { id: '8', text: 'Shame', category: 'Emotion', subcategory: 'Negative' },
      { id: '9', text: 'Boredom', category: 'Emotion', subcategory: 'Negative' },
      // Behavior - Using Resources
      { id: '10', text: 'Using Resource for Syntax', category: 'Behavior', subcategory: 'Using Resources' },
      { id: '11', text: 'Using Resource for Approach', category: 'Behavior', subcategory: 'Using Resources' },
      { id: '12', text: 'Using Resources in General', category: 'Behavior', subcategory: 'Using Resources' },
      // Behavior - Encountering Errors
      { id: '13', text: 'Getting Simple Errors (typos, missing punctuation, etc)', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '14', text: 'SyntaxError / IndentationError', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '15', text: 'Import Error / ModuleNotFoundError', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '16', text: 'TypeError / NameError / KeyError, etc', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '17', text: 'Unexpected Runtime Behavior (logic errors, incorrect results)', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '18', text: 'Fix Error Quickly', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      { id: '19', text: 'Prolonged Error Resolution', category: 'Behavior', subcategory: 'Encountering Errors or Issues' },
      // Process and Strategy
      { id: '20', text: 'Read Question', category: 'Behavior', subcategory: 'Process and Strategy' },
      { id: '21', text: 'Writing a Plan', category: 'Behavior', subcategory: 'Process and Strategy' },
      { id: '22', text: 'Stop to Think (Before Implementation)', category: 'Behavior', subcategory: 'Process and Strategy' },
      { id: '23', text: 'Stop to Think (After Implementation)', category: 'Behavior', subcategory: 'Process and Strategy' },
      { id: '24', text: 'Changing Approach (abandons or modifies plan)', category: 'Behavior', subcategory: 'Process and Strategy' },
      { id: '25', text: 'Implementation', category: 'Behavior', subcategory: 'Process and Strategy' },
      // Run Program
      { id: '26', text: 'Run Program Locally', category: 'Behavior', subcategory: 'Run Program' },
      { id: '27', text: 'Submit', category: 'Behavior', subcategory: 'Run Program' },
      // Debugging or Testing
      { id: '28', text: 'Using a Debugger', category: 'Behavior', subcategory: 'Debugging or Testing' },
      { id: '29', text: 'Using Print Statements', category: 'Behavior', subcategory: 'Debugging or Testing' },
      { id: '30', text: 'Refactoring (reorganizes or optimizes code)', category: 'Behavior', subcategory: 'Debugging or Testing' }
    ];
    
    setLabels(defaultLabels);
    
    // Organize labels into category groups
    const groupedLabels: {[key: string]: {[key: string]: Label[]}} = {};
    
    defaultLabels.forEach(label => {
      if (!groupedLabels[label.category]) {
        groupedLabels[label.category] = {};
      }
      
      const subcategory = label.subcategory || 'General';
      if (!groupedLabels[label.category][subcategory]) {
        groupedLabels[label.category][subcategory] = [];
      }
      
      groupedLabels[label.category][subcategory].push(label);
    });
    
    const groups: CategoryGroup[] = Object.keys(groupedLabels).map(category => ({
      name: category,
      subcategories: groupedLabels[category]
    }));
    
    setCategoryGroups(groups);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsRunning(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // Update log text whenever log changes
  useEffect(() => {
    if (log.length === 0) {
      setLogText('');
      return;
    }
    
    // Add header
    const header = 'timestamp,time_since_start,label\n';
    
    const entries = log.map(entry => {
      return `${entry.timestamp},${entry.timeSinceStart},${entry.label}`;
    }).join('\n');
    
    setLogText(header + entries);
  }, [log]);

  // Load logs from localStorage
  useEffect(() => {
    try {
      const savedLog = localStorage.getItem('observationLog');
      if (savedLog) {
        const parsedLog = JSON.parse(savedLog) as LogEntry[];
        setLog(parsedLog);
      }
    } catch (error) {
      console.error('Error loading saved logs:', error);
    }
  }, []);
  
  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('observationLog', JSON.stringify(log));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }, [log]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not in input or textarea
      if (
        document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      switch(e.key) {
        case 's':
          if (!isRunning) startCountdown();
          break;
        case 'p':
          if (isRunning) pauseCountdown();
          break;
        case 'x':
          stopCountdown();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown functions
  const startCountdown = () => {
    setIsRunning(true);
    if (!startTime) {
      setStartTime(Date.now());
    }
    if (timeRemaining === 0) {
      setTimeRemaining(duration * 60);
    }
  };

  const pauseCountdown = () => {
    setIsRunning(false);
  };

  const stopCountdown = () => {
    setIsRunning(false);
    setTimeRemaining(0);
    setStartTime(null);
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDuration(value);
      if (!isRunning) {
        setTimeRemaining(value * 60);
      }
    }
  };
  
  const setPresetTime = (minutes: number) => {
    if (!isRunning) {
      setDuration(minutes);
      setTimeRemaining(minutes * 60);
    }
  };

  // Labels functions
  const addLabel = () => {
    if (newLabel.trim()) {
      const newId = String(Date.now());
      const newLabelObj = { 
        id: newId, 
        text: newLabel.trim(),
        category: 'Custom',
        subcategory: 'User Added'
      };
      
      setLabels([...labels, newLabelObj]);
      
      // Update category groups
      setCategoryGroups(prevGroups => {
        // Check if Custom category exists
        const customCategoryIndex = prevGroups.findIndex(group => group.name === 'Custom');
        
        if (customCategoryIndex >= 0) {
          // Custom category exists, update it
          const updatedGroups = [...prevGroups];
          const customGroup = {...updatedGroups[customCategoryIndex]};
          
          if (!customGroup.subcategories) {
            customGroup.subcategories = {};
          }
          
          if (!customGroup.subcategories['User Added']) {
            customGroup.subcategories['User Added'] = [];
          }
          
          customGroup.subcategories['User Added'] = [
            ...customGroup.subcategories['User Added'],
            newLabelObj
          ];
          
          updatedGroups[customCategoryIndex] = customGroup;
          return updatedGroups;
        } else {
          // Create new Custom category
          return [
            ...prevGroups,
            {
              name: 'Custom',
              subcategories: {
                'User Added': [newLabelObj]
              }
            }
          ];
        }
      });
      
      // Make sure the Custom category is expanded
      setExpandedCategories(prev => ({
        ...prev,
        'Custom': true
      }));
      
      setNewLabel('');
    }
  };

  const startEditLabel = (id: string) => {
    setEditingLabelId(id);
    const label = labels.find(l => l.id === id);
    if (label) {
      setNewLabel(label.text);
    }
  };

  const saveEditLabel = () => {
    if (editingLabelId && newLabel.trim()) {
      const labelToEdit = labels.find(l => l.id === editingLabelId);
      if (!labelToEdit) return;
      
      const updatedLabel = { 
        ...labelToEdit, 
        text: newLabel.trim() 
      };
      
      // Update labels array
      setLabels(labels.map(label => 
        label.id === editingLabelId ? updatedLabel : label
      ));
      
      // Update category groups
      setCategoryGroups(prevGroups => {
        return prevGroups.map(group => {
          if (group.name === labelToEdit.category && group.subcategories) {
            const subcategory = labelToEdit.subcategory || 'General';
            
            if (group.subcategories[subcategory]) {
              // Create a deep copy of the group
              const updatedGroup = {...group};
              updatedGroup.subcategories = {...group.subcategories};
              
              // Update the label in the subcategory
              updatedGroup.subcategories[subcategory] = group.subcategories[subcategory].map(
                label => label.id === editingLabelId ? updatedLabel : label
              );
              
              return updatedGroup;
            }
          }
          return group;
        });
      });
      
      setNewLabel('');
      setEditingLabelId(null);
    }
  };

  const deleteLabel = (id: string) => {
    const labelToDelete = labels.find(label => label.id === id);
    
    setLabels(labels.filter(label => label.id !== id));
    
    if (labelToDelete) {
      // Also remove from category groups
      setCategoryGroups(prevGroups => {
        return prevGroups.map(group => {
          if (group.name === labelToDelete.category && group.subcategories) {
            const subcategory = labelToDelete.subcategory || 'General';
            
            if (group.subcategories[subcategory]) {
              const updatedSubcategory = group.subcategories[subcategory].filter(
                label => label.id !== id
              );
              
              // Create new group with updated subcategory
              const updatedGroup = {...group};
              updatedGroup.subcategories = {...group.subcategories};
              
              if (updatedSubcategory.length > 0) {
                updatedGroup.subcategories[subcategory] = updatedSubcategory;
              } else {
                // Remove empty subcategory
                delete updatedGroup.subcategories[subcategory];
              }
              
              return updatedGroup;
            }
          }
          return group;
        }).filter(group => {
          // Remove empty groups (no subcategories)
          if (!group.subcategories) return false;
          return Object.keys(group.subcategories).length > 0;
        });
      });
    }
    
    if (editingLabelId === id) {
      setEditingLabelId(null);
      setNewLabel('');
    }
  };

  // Log functions
  const addLogEntry = (labelText: string) => {
    if (!startTime) return;
    
    const now = Date.now();
    const timestamp = Math.floor(now / 1000); // Unix timestamp
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeSinceStart = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const newEntry: LogEntry = {
      timestamp,
      timeSinceStart,
      label: labelText
    };
    
    setLog([...log, newEntry]);
  };

  const handleLogTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLogText(e.target.value);
  };

  const copyLogToClipboard = () => {
    navigator.clipboard.writeText(logText);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Clear log with confirmation
  const clearLog = () => {
    if (log.length === 0) return;
    
    const confirmClear = window.confirm('Are you sure you want to clear all recorded observations? This cannot be undone.');
    if (confirmClear) {
      setLog([]);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Behavior-Affect Observation Tool</h1>
      </header>

      <main>
        <section className="countdown-section">
          <h2>Countdown</h2>
          <div className="countdown-display">
            {formatTime(timeRemaining)}
          </div>
          <div className="countdown-controls">
            <input 
              type="number" 
              value={duration} 
              onChange={handleDurationChange} 
              min="1" 
              disabled={isRunning}
            /> minutes
            <div className="preset-times">
              <button 
                onClick={() => setPresetTime(1)} 
                disabled={isRunning} 
                className="preset-button"
              >
                1 m
              </button>
              <button 
                onClick={() => setPresetTime(5)} 
                disabled={isRunning} 
                className="preset-button"
              >
                5 m
              </button>
              <button 
                onClick={() => setPresetTime(15)} 
                disabled={isRunning} 
                className="preset-button"
              >
                15 m
              </button>
              <button 
                onClick={() => setPresetTime(20)} 
                disabled={isRunning} 
                className="preset-button"
              >
                20 m
              </button>
              <button 
                onClick={() => setPresetTime(30)} 
                disabled={isRunning} 
                className="preset-button"
              >
                30 m
              </button>
            </div>
            <div className="button-group">
              <button onClick={startCountdown} disabled={isRunning}>Start (s)</button>
              <button onClick={pauseCountdown} disabled={!isRunning}>Pause (p)</button>
              <button onClick={stopCountdown}>Stop (x)</button>
            </div>
          </div>
        </section>

        <section className="labels-section">
          <h2>Labels</h2>
          <div className="label-controls">
            <input 
              type="text" 
              value={newLabel} 
              onChange={(e) => setNewLabel(e.target.value)} 
              placeholder="New label"
            />
            {editingLabelId ? (
              <button onClick={saveEditLabel}>Save</button>
            ) : (
              <button onClick={addLabel}>Add</button>
            )}
          </div>

          <div className="category-groups">
            {categoryGroups.map(group => (
              <div key={group.name} className="category-group">
                <div 
                  className="category-header"
                  onClick={() => toggleCategory(group.name)}
                >
                  <h3>{group.name}</h3>
                  <span>{expandedCategories[group.name] ? '▼' : '►'}</span>
                </div>
                
                {expandedCategories[group.name] && group.subcategories && (
                  <div className="subcategories">
                    {Object.keys(group.subcategories).map(subCategory => (
                      <div key={subCategory} className="subcategory">
                        <h4>{subCategory}</h4>
                        <div className="labels-grid">
                          {group.subcategories![subCategory].map(label => (
                            <div key={label.id} className="label-item">
                              <button 
                                className="label-button"
                                onClick={() => addLogEntry(label.text)}
                                disabled={!startTime}
                              >
                                {label.text}
                              </button>
                              <div className="label-actions">
                                <button onClick={() => startEditLabel(label.id)}>Edit</button>
                                <button onClick={() => deleteLabel(label.id)}>Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="log-section">
          <h2>Log</h2>
          <div className="log-controls">
            <button onClick={copyLogToClipboard}>Copy to Clipboard</button>
            <button onClick={clearLog} className="clear-button">Clear Log</button>
          </div>
          <div className="log-status">
            {log.length === 0 ? (
              <p className="empty-log-message">No observations recorded yet. Start the timer and click on labels to record observations.</p>
            ) : (
              <p className="log-info">{log.length} observations recorded</p>
            )}
          </div>
          <textarea 
            value={logText} 
            onChange={handleLogTextChange} 
            rows={10} 
            className="log-textarea"
            placeholder="Recorded observations will appear here"
          />
        </section>
      </main>
    </div>
  );
}

export default App;
