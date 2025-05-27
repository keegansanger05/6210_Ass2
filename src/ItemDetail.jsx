import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

function ItemDetail() {
    const { id } = useParams();
    const [itemData, setItemData] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const fetchItemDetails = async () => {
            const { data, error } = await supabase
                .from('SCP files')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching item:', error);
            } else {
                setItemData(data);

                // If image is a storage path, get signed URL
                if (data?.image) {
                    const { data: signedUrlData, error: urlError } = await supabase
                        .storage
                        .from('images')
                        .createSignedUrl(data.image, 60 * 60); // 1 hour

                    if (signedUrlData?.signedUrl) {
                        setImageUrl(signedUrlData.signedUrl);
                    } else {
                        setImageUrl(null);
                        if (urlError) console.error('Signed URL error:', urlError);
                    }
                } else {
                    setImageUrl(null);
                }
            }
        };

        fetchItemDetails();
    }, [id]);

return (
    <div>
        {
            itemData ? (
                <>
                    
                    <h1>{itemData.item}</h1>
                <div class="scp-container">
                
                <div class="scp-text">
                    <h2>Object Class</h2>
                    <h3>{itemData.class}</h3>
                    <h2>Description</h2>
                    <p>{itemData.description}</p>
                    <h2>Containment</h2>
                    <p>{itemData.containment}</p>
                </div>
                                <div className="scp-image">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={itemData.item}
                                style={{ maxWidth: '400px', maxHeight: '400px', border: '1px solid #333' }}
                            />
                        ) : (
                            <p>No image available.</p>
                        )}
                </div>
                </div>
                </>
            ) : (
                <p>Loading...</p>
            )
        }
    </div>
);

}

export default ItemDetail;
