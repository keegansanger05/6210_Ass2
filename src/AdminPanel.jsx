import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Admin panel component for managing SCP records
function AdminPanel() {
    // State to hold the list of items from the database
    const [items, setItems] = useState([]);

    // State to handle the form for adding new records
    const [newRecord, setNewRecord] = useState({
        item: '',
        class: '',
        description: '',
        containment: '',
        image: ''
    });

    // State to manage currently edited item
    const [editRecord, setEditRecord] = useState(null);

    // Fetch items when the component mounts
    useEffect(() => {
        fetchItems();
    }, []);

    // Fetch and filter items from Supabase, then attach signed image URLs if needed
    const fetchItems = async () => {
        const { data, error } = await supabase.from('SCP files').select('*');
        if (error) {
            console.error(error);
        } else {
            // Filter items with SCP numbers between 010 and 029, and sort them numerically
                const filteredSorted = data.sort((a, b) => {
                    const numA = parseInt(a.item.match(/\d+/)?.[0] || 0, 10);
                    const numB = parseInt(b.item.match(/\d+/)?.[0] || 0, 10);
                    return numA - numB;
                });


            // For each item, check the image field:
            // - If it's a public URL, use it directly
            // - If it's a Supabase storage path, generate a signed URL
            const itemsWithUrls = await Promise.all(filteredSorted.map(async (item) => {
                if (item.image) {
                    if (/^https?:\/\//.test(item.image)) {
                        return { ...item, imageUrl: item.image };
                    } else {
                        const { data: signedUrlData } = await supabase
                            .storage
                            .from('images')
                            .createSignedUrl(item.image, 60 * 60);
                        return { ...item, imageUrl: signedUrlData?.signedUrl || null };
                    }
                }
                return { ...item, imageUrl: null };
            }));

            setItems(itemsWithUrls);
        }
    };

    // Insert a new record into the database
    const addItem = async () => {
        // Simple field validation
        if (!newRecord.item || !newRecord.class || !newRecord.description || !newRecord.containment) {
            alert('Please fill in all fields.');
            return;
        }

        const { error } = await supabase.from('SCP files').insert([newRecord]);
        if (error) {
            alert(error.message);
            console.error(error);
        } else {
            // Clear form and refresh items
            setNewRecord({
                item: '',
                class: '',
                description: '',
                containment: '',
                image: ''
            });
            fetchItems();
        }
    };

    // Delete a record by ID
    const deleteItem = async (id) => {
        const { error } = await supabase.from('SCP files').delete().eq('id', id);
        if (error) {
            console.error(error);
        } else {
            fetchItems();
        }
    };

    // Begin editing a specific item
    const startEditing = (item) => {
        setEditRecord({ ...item });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditRecord(null);
    };

    // Save changes to an edited record
    const saveEdit = async (id) => {
        const { error } = await supabase.from('SCP files').update(editRecord).eq('id', id);
        if (error) {
            console.error(error);
        } else {
            setEditRecord(null);
            fetchItems();
        }
    };

    return (
        <div>
            <h2>Admin Panel</h2>

            {/* Section to add a new SCP record */}
            <h3>Add New Record</h3>
            <div>
                {/* Input fields for new record */}
                <input
                    value={newRecord.item}
                    onChange={(e) => setNewRecord({ ...newRecord, item: e.target.value })}
                    placeholder="Item (e.g. SCP-010)"
                    style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                />
                <select
                    value={newRecord.class}
                    onChange={(e) => setNewRecord({ ...newRecord, class: e.target.value })}
                    style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                >
                    <option value="Safe">Safe</option>
                    <option value="Euclid">Euclid</option>
                    <option value="Keter">Keter</option>
                </select>
                <input
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    placeholder="Description"
                    style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                />
                <input
                    value={newRecord.containment}
                    onChange={(e) => setNewRecord({ ...newRecord, containment: e.target.value })}
                    placeholder="Containment"
                    style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                />
                <input
                    value={newRecord.image}
                    onChange={(e) => setNewRecord({ ...newRecord, image: e.target.value })}
                    placeholder="Image URL"
                    style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                />
                <button
                    onClick={addItem}
                    style={{ backgroundColor: 'green', color: 'white', padding: '8px', border: 'none', borderRadius: '4px' }}
                >
                    Add Item
                </button>
            </div>

            <hr />

            {/* List of existing items with edit/delete controls */}
            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {editRecord && editRecord.id === item.id ? (
                            // Editable form for a specific item
                            <div>
                                <input
                                    value={editRecord.item}
                                    onChange={(e) => setEditRecord({ ...editRecord, item: e.target.value })}
                                />
                                <select
                                    value={editRecord.class}
                                    onChange={(e) => setEditRecord({ ...editRecord, class: e.target.value })}
                                >
                                    <option value="Safe">Safe</option>
                                    <option value="Euclid">Euclid</option>
                                    <option value="Keter">Keter</option>
                                </select>
                                <input
                                    value={editRecord.description}
                                    onChange={(e) => setEditRecord({ ...editRecord, description: e.target.value })}
                                />
                                <input
                                    value={editRecord.containment}
                                    onChange={(e) => setEditRecord({ ...editRecord, containment: e.target.value })}
                                />
                                <input
                                    value={editRecord.image}
                                    onChange={(e) => setEditRecord({ ...editRecord, image: e.target.value })}
                                />
                                <button
                                    onClick={() => saveEdit(item.id)}
                                    style={{ backgroundColor: 'green', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', marginRight: '8px' }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    style={{ backgroundColor: 'red', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // Display mode for an item
                            <div>
                                <p><strong>{item.item}</strong> - {item.class}</p>
                                <h5>Description</h5>
                                <p>{item.description}</p>
                                <h5>Containment</h5>
                                <p>{item.containment}</p>

                                {item.imageUrl && (
                                    <>
                                        <h5>Image</h5>
                                        <img src={item.imageUrl} alt={item.item} style={{ maxWidth: '200px', marginBottom: '10px' }} />
                                    </>
                                )}

                                <button
                                    onClick={() => startEditing(item)}
                                    style={{ backgroundColor: 'green', color: 'white', padding: '8px', border: 'none', borderRadius: '4px' }}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    style={{ backgroundColor: 'red', color: 'white', padding: '8px', border: 'none', borderRadius: '4px' }}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AdminPanel;
