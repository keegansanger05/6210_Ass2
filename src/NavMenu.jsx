import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

function NavMenu() {
    const [item, setItem] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase.from('SCP files').select('id, item');
            if (error) {
                console.error(error);
            } else {
                setItem(data);
            }
        };
        fetchItems();
    }, []);

    const extractNumber = (itemName) => {
        const match = itemName.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    };

    const sortedItems = item
        .map((i) => ({ ...i, number: extractNumber(i.item) }))
        .filter((i) => i.number >= 10 && i.number <= 29)
        .sort((a, b) => a.number - b.number);

    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {
                    sortedItems.map((items) => (
                        <li key={items.id}>
                            <Link to={`/item/${items.id}`}>{items.item}</Link>
                        </li>
                    ))
                }
                <li>
                    <Link to="/admin">Admin Panel</Link>
                </li>
            </ul>
        </nav>
    );
}

export default NavMenu;
