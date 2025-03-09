import React from 'react';
import {Typography} from "@mui/material";
import CreateGiftBox from "../../MainMenu/CreateGiftBox";
import GiftSetList from "./GiftSetList";

const GiftSetsPage = () => {
    return (
        <div>
            <Typography>
                Подарункові набори
            </Typography>

            <CreateGiftBox/>

            <GiftSetList/>

            {/*TODO add giftbox*/}
            {/*//TODO add giftbox management*/}
            {/*//TODO add giftbox history*/}
            {/*//TODO add giftbox settings*/}
            {/*//TODO add giftbox sales*/}

        </div>
    );
};

export default GiftSetsPage;
