import {Typography} from "@mui/material";

const SummarySection = ({calculateTotalCost, calculateProfit}) => (
    <>
        <Typography variant="h6" sx={{mt: 4}}>
            Загальна собівартість: {calculateTotalCost().toFixed(2)} грн
        </Typography>
        <Typography variant="h6">
            Прибуток: {calculateProfit().toFixed(2)} грн
        </Typography>
    </>
);

export default SummarySection;