// PackagingContext.js
import {createContext, useContext, useEffect, useState, useCallback, useMemo} from 'react';
import {IMaterial} from "../../utils/types";
import {fetchListPackagingMaterials} from "../../api/_packagingMaterials";
import { PropsWithChildren } from 'react';


interface IPackagingContextProps {
    packagingMaterials: IMaterial[];
    fetchPackagingOptions: () => Promise<void>;

    loading: boolean;
    error: string | null;
    // addPackaging: (newPackaging: any) => void;
    // updatePackaging: (id: number, updatedPackaging: any) => void;
    // deletePackaging: (id: number) => void;
}

const PackagingContext = createContext<IPackagingContextProps | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const usePackaging = () => {
    const context = useContext(PackagingContext);

    if (!context) {
        throw new Error('usePackaging must be used within PackagingProvider');
    }

    return context;
};

export const PackagingProvider = ({ children }: PropsWithChildren) => {
    const [packagingMaterials, setPackagingMaterials] = useState<IMaterial[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<null | string>(null);

    const fetchPackagingOptions = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            const materials = await fetchListPackagingMaterials();
            setPackagingMaterials(materials);
        } catch (err) {
            setError('Не вдалося завантажити пакувальні матеріали');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchPackagingOptions();
    }, [fetchPackagingOptions]);


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

    const contextValue = useMemo(() => ({
        packagingMaterials,
        fetchPackagingOptions,
        loading,
        error,
    }), [packagingMaterials, fetchPackagingOptions, loading, error]);

    return (
        <PackagingContext.Provider value={contextValue}>
            {children}
        </PackagingContext.Provider>
    );
};
