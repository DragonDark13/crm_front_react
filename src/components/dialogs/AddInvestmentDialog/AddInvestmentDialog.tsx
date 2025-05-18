import React from "react";
import {TextField, Button, DialogContent, DialogActions} from "@mui/material";
import CustomDialog from "../CustomDialog/CustomDialog";
import {INewInvestment} from "../../../utils/types";
import ProductNameField from "../../FormComponents/ProductNameField";
import PriceField from "../../FormComponents/PriceField";
import {parseDecimalInput} from "../../../utils/_validation";
import DateFieldCustom from "../../FormComponents/DateFieldCustom";
import CancelButton from "../../Buttons/CancelButton";

interface AddInvestmentDialogProps {
    isAuthenticated: boolean
    open: boolean;
    onClose: () => void;
    onAdd: () => void;
    newInvestment: INewInvestment;
    setNewInvestment: (value: INewInvestment) => void;
}

const AddInvestmentDialog: React.FC<AddInvestmentDialogProps> = ({
                                                                     open,
                                                                     onClose,
                                                                     onAdd,
                                                                     newInvestment,
                                                                     setNewInvestment,
                                                                     isAuthenticated
                                                                 }) => {
    return (
        <CustomDialog
            maxWidth="sm"
            open={open}
            handleClose={onClose}
            title="Додати інвестицію"
        >
            <DialogContent>
                <ProductNameField label={'Назва'} value={newInvestment.type_name} onChange={(e) =>
                    setNewInvestment({...newInvestment, type_name: e.target.value})
                } error={null}/>
                {/*<TextField*/}
                {/*    label="Назва"*/}
                {/*    fullWidth*/}
                {/*    margin="normal"*/}
                {/*    value={newInvestment.type_name}*/}
                {/*    onChange={(e) =>*/}
                {/*        setNewInvestment({...newInvestment, type_name: e.target.value})*/}
                {/*    }*/}
                {/*/>*/}

                <ProductNameField label={"Постачальник"} value={newInvestment.supplier}
                                  onChange={(e) =>
                                      setNewInvestment({...newInvestment, supplier: e.target.value})
                                  } error={null}/>

                <PriceField label={"Вартість"} value={newInvestment.cost} onChange={(e) => {
                    const parsed = parseDecimalInput(e.target.value);
                    if (parsed !== null) {
                        setNewInvestment({...newInvestment, cost: parsed})
                    }
                }
                }
                />
                {/*<TextField*/}
                {/*    label="Вартість"*/}
                {/*    fullWidth*/}
                {/*    margin="normal"*/}
                {/*    value={newInvestment.cost}*/}
                {/*    onChange={(e) =>*/}
                {/*        setNewInvestment({...newInvestment, cost: e.target.value})*/}
                {/*    }*/}
                {/*/>*/}
                <DateFieldCustom InputLabelProps={{shrink: true}} label="Дата Закупки" value={newInvestment.date}
                                 onChange={(e) =>
                                     setNewInvestment({...newInvestment, date: e.target.value})
                                 }/>
                {/*<TextField*/}
                {/*    label="Дата"*/}
                {/*    type="date"*/}
                {/*    fullWidth*/}
                {/*    margin="normal"*/}
                {/*    InputLabelProps={{shrink: true}}*/}
                {/*    value={newInvestment.date}*/}
                {/*    onChange={(e) =>*/}
                {/*        setNewInvestment({...newInvestment, date: e.target.value})*/}
                {/*    }*/}
                {/*/>*/}
            </DialogContent>
            <DialogActions>
                {/*<Button onClick={onClose}>Скасувати</Button>*/}
                <CancelButton onClick={onClose}/>
                <Button disabled={!isAuthenticated} variant="contained" onClick={onAdd}>
                    Додати
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default AddInvestmentDialog;
