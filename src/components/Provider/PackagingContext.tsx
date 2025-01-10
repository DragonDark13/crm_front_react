// PackagingContext.js
import {createContext, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import {IMaterial} from "../../utils/types";
import {fetchListPackagingMaterials} from "../../api/_packagingMaterials";

interface IPackagingContextProps {
    packagingMaterials: IMaterial[];
    fetchPackagingOptions: () => void;
    // addPackaging: (newPackaging: any) => void;
    // updatePackaging: (id: number, updatedPackaging: any) => void;
    // deletePackaging: (id: number) => void;
    loading: boolean;
    error: string | null;
}

const PackagingContext = createContext<IPackagingContextProps | undefined>(undefined);

export const usePackaging = () => {
    return useContext(PackagingContext);
};

export const PackagingProvider = ({children}) => {
    const [packagingMaterials, setPackagingMaterials] = useState<IMaterial[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);

    const fetchPackagingOptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const {materials} = await fetchListPackagingMaterials();
            setPackagingMaterials(materials);
        } catch (err) {
            setError('Не вдалося завантажити пакувальні матеріали');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackagingOptions();
    }, []);


    // TODO addPackaging
    // const addPackaging = async (newPackaging) => {
    //     try {
    //         const response = await axios.post('/api/packaging', newPackaging);
    //         setPackagingMaterials((prevOptions) => [...prevOptions, response.data]);
    //     } catch (err) {
    //         setError(err.message || 'Failed to add new packaging');
    //     }
    // };

    // TODO updatePackaging
    // const updatePackaging = async (id, updatedPackaging) => {
    //     try {
    //         const response = await axios.put(`/api/packaging/${id}`, updatedPackaging);
    //         setPackagingMaterials((prevOptions) =>
    //             prevOptions.map((item) => (item.id === id ? response.data : item))
    //         );
    //     } catch (err) {
    //         setError(err.message || 'Failed to update packaging');
    //     }
    // };
// TODO deletePackaging

//     const deletePackaging = async (id) => {
//         try {
//             await axios.delete(`/api/packaging/${id}`);
//             setPackagingMaterials((prevOptions) =>
//                 prevOptions.filter((item) => item.id !== id)
//             );
//         } catch (err) {
//             setError(err.message || 'Failed to delete packaging');
//         }
//     };

    return (
        <PackagingContext.Provider
            value={{
                packagingMaterials,
                fetchPackagingOptions,
                loading,
                error,
            }}
        >
            {children}
        </PackagingContext.Provider>
    );
};
