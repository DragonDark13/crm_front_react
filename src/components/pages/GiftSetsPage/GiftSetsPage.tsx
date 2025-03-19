import React from 'react';
import {Typography} from "@mui/material";
import AddGiftBoxModal from "../../MainMenu/CreateGiftBox";
import GiftSetList from "./GiftSetList";

const GiftSetsPage = () => {
    return (
        <div>
              <Typography marginBlockEnd={3} variant={"h4"}>Create Gift Set</Typography>

            {/*<CreateGiftBox/>*/}

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
