import {Divider, Grid, TextField, Typography} from "@mui/material";
import ProductNameField from "../../FormComponents/ProductNameField";
import PriceField from "../../FormComponents/PriceField";

const GiftSetDetailsSection = ({name, setName, description, setDescription, price, setPrice}) => (
    <>
        <Typography variant={"body1"}>Основна інформація</Typography>
        <Divider sx={{my: 2}}/>
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
                <ProductNameField label={"Назва набору"} value={name} onChange={(e) => setName(e.target.value)}
                                  error={null}/>

            </Grid>
            <Grid item xs={12} md={6}>
                <ProductNameField label={"Опис"} value={description} onChange={(e) => setDescription(e.target.value)}
                                  error={null}/>
                {/*<TextField*/}
                {/*    label="Опис"*/}
                {/*    fullWidth*/}
                {/*    value={description}*/}
                {/*    onChange={(e) => setDescription(e.target.value)}*/}
                {/*/>*/}
            </Grid>
            <Grid item xs={12} md={2}>
                <PriceField label={"Ціна набору"} value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}/>
                {/*<TextField*/}
                {/*    label="Ціна продажу"*/}
                {/*    fullWidth*/}
                {/*    type="number"*/}
                {/*    value={price}*/}
                {/*    onChange={(e) => setPrice(Number(e.target.value))}*/}
                {/*/>*/}
            </Grid>
        </Grid>
    </>
);
export default GiftSetDetailsSection