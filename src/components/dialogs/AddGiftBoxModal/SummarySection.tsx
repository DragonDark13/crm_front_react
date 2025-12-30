import {Typography} from "@mui/material";

interface ISummarySection {
    calculateTotalCost: ()=>number
    calculateProfit: ()=>number
}
const SummarySection = ({calculateTotalCost, calculateProfit}:ISummarySection) => (
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