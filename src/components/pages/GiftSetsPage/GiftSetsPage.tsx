import React from 'react';
import {Box, Typography} from "@mui/material";
import GiftSetList from "./GiftSetList";
import {useGiftBoxModal} from "../../../hooks/useGiftBoxModal";
import {useProducts} from "../../Provider/ProductContext";
import {usePackaging} from "../../Provider/PackagingContext";
import {useAuth} from "../../context/AuthContext";
import {modalNames} from "../../../utils/types";
import AddButton from "../../Buttons/AddButton";
import AddGiftBoxModal from "../../dialogs/AddGiftBoxModal/AddGiftBoxModal";

const GiftSetsPage = () => {
    const {fetchProductsFunc} = useProducts();
    const {fetchPackagingOptions} = usePackaging();
    const {isAuthenticated} = useAuth();


    const {
        modalState,
        handleModalOpen,
        handleModalClose,
        handleAddNewGiftBox
    } = useGiftBoxModal(modalNames, fetchProductsFunc, fetchPackagingOptions);

    console.log("isAuthenticated3", isAuthenticated);


    return (
        <div>
            <Typography marginBlockEnd={3} variant={"h4"}>Подарункові бокси</Typography>

            {/*<CreateGiftBox/>*/}
            <AddButton onClick={() => handleModalOpen('addNewGiftBox')} text={'Створити подарунковий набір'}/>


            <GiftSetList isAuthenticated={isAuthenticated}/>

            {/*TODO add giftbox*/}
            {/*//TODO add giftbox management*/}
            {/*//TODO add giftbox history*/}
            {/*//TODO add giftbox settings*/}
            {/*//TODO add giftbox sales*/}

            {modalState.addNewGiftBox &&
            <AddGiftBoxModal
                isAuthenticated={isAuthenticated}
                handleCloseGiftModal={() => handleModalClose('addNewGiftBox')}
                openGiftModal={modalState.addNewGiftBox}
                handleAddNewGiftBox={handleAddNewGiftBox}
            />}

        </div>
    );
};

export default GiftSetsPage;
