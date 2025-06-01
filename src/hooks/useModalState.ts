// useModalState.ts
import {useState} from "react";

export const useModalState = <T extends string>(modalNames: T[]) => {
    const [modalState, setModalState] = useState<Record<T, boolean>>(
        Object.fromEntries(modalNames.map(name => [name, false])) as Record<T, boolean>
    );

    const open = (modal: T) => setModalState(prev => ({...prev, [modal]: true}));
    const close = (modal: T) => setModalState(prev => ({...prev, [modal]: false}));

    return {modalState, open, close};
};
