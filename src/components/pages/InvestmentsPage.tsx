import React, {useState, useEffect} from "react";
import axios from "axios";
import {
    TextField,
    Button,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableHead,
    Grid,
    Paper,
    TableContainer, Typography, IconButton, Tooltip
} from "@mui/material";
import {axiosInstance} from "../../api/api";
import DeleteAllMaterialsDialog from "../dialogs/packagingModal/DeleteAllMaterialsDialog/DeleteAllMaterialsDialog";
import {useAuth} from "../context/AuthContext";
import DeleteAllInvestmentsDialog from "../dialogs/DeleteAllInvestmentsDialog/DeleteAllInvestmentsDialog";
import DeleteButton from "../Buttons/DeleteButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddInvestmentDialog from "../dialogs/AddInvestmentDialog/AddInvestmentDialog";
import {INewInvestment, Investment} from "../../utils/types";


const InvestmentsPage: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [newInvestment, setNewInvestment] = useState<INewInvestment>({
        type_name: "",
        cost: 0,
        date: new Date().toISOString().slice(0, 10),
        supplier: ""
    });

    const [addInvestDialogOpen, setAdInvestDialogOpen] = useState(false);

    const fetchInvestments = async () => {
        const response = await axiosInstance.get("/gel_all_investments");
        setInvestments(response.data);
    };

    const resetNewInvestmentDialog = () => {
        setNewInvestment({type_name: "", cost: 0, date: new Date().toISOString().slice(0, 10), supplier: ""});

    }

    const handleAddInvestment = async () => {
        await axiosInstance.post("/create_new_investments", newInvestment);
        await fetchInvestments();
        setAdInvestDialogOpen(false)
        resetNewInvestmentDialog();
    };

    const handleDeleteInvestment = async (id: number) => {
        await axiosInstance.delete(`/investments/${id}`);
        await fetchInvestments();
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    const {isAuthenticated} = useAuth()

    const handleAddInvestmentClose = () => {
        resetNewInvestmentDialog();
        setAdInvestDialogOpen(false)
    }


    return (
        <div>
            <h2>Інші вкладення</h2>
            {isAuthenticated && <Grid container>
                <Grid item>
                    <DeleteAllInvestmentsDialog/>
                </Grid>
            </Grid>}
            <Button variant="contained" onClick={() => setAdInvestDialogOpen(true)}>
                Додати інвестицію
            </Button>

            <AddInvestmentDialog
                isAuthenticated={isAuthenticated}
                newInvestment={newInvestment}
                onAdd={handleAddInvestment}
                onClose={handleAddInvestmentClose} open={addInvestDialogOpen}
                setNewInvestment={setNewInvestment}/>

            {/*<div>*/}
            {/*    <TextField*/}
            {/*        label="Назва"*/}
            {/*        value={newInvestment.type_name}*/}
            {/*        onChange={(e) => setNewInvestment({...newInvestment, type_name: e.target.value})}*/}
            {/*    />*/}
            {/*    <TextField*/}
            {/*        label="Вартість"*/}
            {/*        value={newInvestment.cost}*/}
            {/*        onChange={(e) => setNewInvestment({...newInvestment, cost: e.target.value})}*/}
            {/*    />*/}
            {/*    <TextField*/}
            {/*        label="Дата"*/}
            {/*        type="date"*/}
            {/*        InputLabelProps={{shrink: true}}*/}
            {/*        value={newInvestment.date}*/}
            {/*        onChange={(e) => setNewInvestment({...newInvestment, date: e.target.value})}*/}
            {/*    />*/}
            {/*    <Button variant="contained" onClick={handleAddInvestment}>*/}
            {/*        Додати*/}
            {/*    </Button>*/}
            {/*</div>*/}
            <TableContainer component={Paper} style={{marginTop: '20px'}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><Typography>Назва</Typography></TableCell>
                            <TableCell><Typography>Вартість</Typography></TableCell>
                            <TableCell><Typography>Постачальник</Typography></TableCell>
                            <TableCell><Typography>Дата</Typography></TableCell>
                            <TableCell><Typography>Дії</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {investments.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell size={"small"}>{inv.type_name}</TableCell>
                                <TableCell size={"small"}>{inv.cost}</TableCell>
                                <TableCell size={"small"}>{inv.supplier}</TableCell>
                                <TableCell size={"small"}>{inv.date}</TableCell>
                                <TableCell size={"small"}>
                                    <Tooltip title="Видалити">
                                            <span>
                                            <IconButton disabled={!isAuthenticated} color="error"
                                                        onClick={() => handleDeleteInvestment(inv.id)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                            </span>
                                    </Tooltip>
                                    {/*<DeleteButton onClick={() => handleDeleteInvestment(inv.id)}/>*/}

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default InvestmentsPage;
