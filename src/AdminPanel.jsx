import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AdminPanel() {
    const [items, setItems] = useState([]);
    const [newRecord, setNewRecord] = useState({
        item: '',
        class: '',
        description: '',
        containment: '',
        image: ''
    });

    const [editRecord, setEditRecord] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const { data, error } = await supabase.from('SCP files').select('*');
        if (error) {
            console.error(error);
        } else {
            const filteredSorted = data
                .filter((item) => {
                    const match = item.item.match(/\d+/);
                    const num = match ? parseInt(match[0], 10) : null;
                    return num >= 10 && num <= 29;
                })
                .sort((a, b) => {
                    const numA = parseInt(a.item.match(/\d+/)[0], 10);
                    const numB = parseInt(b.item.match(/\d+/)[0], 10);
                    return numA - numB;
                });

            // Generate signed URLs for storage images
            const itemsWithUrls = await Promise.all(filteredSorted.map(async (item) => {
                if (item.image) {
                    if (/^https?:\/\//.test(item.image)) {
                        // Public URL, use as is
                        return { ...item, imageUrl: item.image };
                    } else {
                        // Storage path, get signed URL
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

const addItem = async () => {
    // Basic validation
    if (!newRecord.item || !newRecord.class || !newRecord.description || !newRecord.containment) {
        alert('Please fill in all fields.');
        return;
    }

    const { error } = await supabase.from('SCP files').insert([newRecord]);
    if (error) {
        alert(error.message); // Show error to user
        console.error(error);
    } else {
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

    const deleteItem = async (id) => {
        const { error } = await supabase.from('SCP files').delete().eq('id', id);
        if (error) {
            console.error(error);
        } else {
            fetchItems();
        }
    };

    const startEditing = (item) => {
        setEditRecord({ ...item });
    };

    const cancelEdit = () => {
        setEditRecord(null);
    };

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

            <h3>Add New Record</h3>
            <div>
                <input
                    value={newRecord.item}
                    onChange={(e) => setNewRecord({ ...newRecord, item: e.target.value })}style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                    placeholder="Item (e.g. SCP-010)"
                />
                <select
                    value={newRecord.class}
                    onChange={(e) => setNewRecord({ ...newRecord, class: e.target.value })}style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                >
                    <option value="Safe">Safe</option>
                    <option value="Euclid">Euclid</option>
                    <option value="Keter">Keter</option>
                </select>
                <input
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                    placeholder="Description"
                />
                <input
                    value={newRecord.containment}
                    onChange={(e) => setNewRecord({ ...newRecord, containment: e.target.value })}style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                    placeholder="Containment"
                />
                <input
                    value={newRecord.image}
                    onChange={(e) => setNewRecord({ ...newRecord, image: e.target.value })}style={{ backgroundColor: 'white', color: 'black', padding: '1vh', border: 'none', borderRadius: '4px' }}
                    placeholder="Image URL"
                />
                <button onClick={addItem}style={{ backgroundColor: 'green', color: 'white', padding: '8px', border: 'none', borderRadius: '4px' }}>Add Item</button>
            </div>

            <hr />

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {editRecord && editRecord.id === item.id ? (
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
                            <div>
                                {item.imageUrl && <img src={item.imageUrl} alt={item.item} style={{ maxWidth: '200px', marginBottom: '10px' }} />}
                                <p><strong>{item.item}</strong> - {item.class}</p>
                                <p>{item.description}</p>
                                <p>{item.containment}</p>
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