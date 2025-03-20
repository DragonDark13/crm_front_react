import React, {useState, useEffect} from "react";
import axios from "axios";
import {TextField, Button, Table, TableRow, TableCell, TableBody, TableHead, Grid, Paper} from "@mui/material";
import {axiosInstance} from "../../api/api";
import DeleteAllMaterialsDialog from "../dialogs/packagingModal/DeleteAllMaterialsDialog/DeleteAllMaterialsDialog";
import {useAuth} from "../context/AuthContext";
import DeleteAllInvestmentsDialog from "../dialogs/DeleteAllInvestmentsDialog/DeleteAllInvestmentsDialog";

interface Investment {
    supplier: string;
    id: number;
    type_name: string;
    cost: number;
    date: string;
}

const InvestmentsPage: React.FC = () => {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [newInvestment, setNewInvestment] = useState({
        type_name: "",
        cost: "",
        date: "",
    });

    const fetchInvestments = async () => {
        const response = await axiosInstance.get("/gel_all_investments");
        setInvestments(response.data);
    };

    const handleAddInvestment = async () => {
        await axios.post("/api/investments", newInvestment);
        await fetchInvestments();
        setNewInvestment({type_name: "", cost: "", date: ""});
    };

    const handleDeleteInvestment = async (id: number) => {
        await axios.delete(`/api/investments/${id}`);
        await fetchInvestments();
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    const {isAuthenticated} = useAuth();


    return (
        <div>
            <h2>Інші вкладення</h2>
            {isAuthenticated && <Grid container>
                <Grid item>
                    <DeleteAllInvestmentsDialog/>
                </Grid>
            </Grid>}
            <div>
                <TextField
                    label="Назва"
                    value={newInvestment.type_name}
                    onChange={(e) => setNewInvestment({...newInvestment, type_name: e.target.value})}
                />
                <TextField
                    label="Вартість"
                    value={newInvestment.cost}
                    onChange={(e) => setNewInvestment({...newInvestment, cost: e.target.value})}
                />
                <TextField
                    label="Дата"
                    type="date"
                    InputLabelProps={{shrink: true}}
                    value={newInvestment.date}
                    onChange={(e) => setNewInvestment({...newInvestment, date: e.target.value})}
                />
                <Button variant="contained" onClick={handleAddInvestment}>
                    Додати
                </Button>
            </div>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Назва</TableCell>
                        <TableCell>Вартість</TableCell>
                        <TableCell>Постачальник</TableCell>
                        <TableCell>Дата</TableCell>
                        <TableCell>Дії</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {investments.map((inv) => (
                        <TableRow key={inv.id}>
                            <TableCell>{inv.type_name}</TableCell>
                            <TableCell>{inv.cost}</TableCell>
                            <TableCell>{inv.supplier}</TableCell>
                            <TableCell>{inv.date}</TableCell>
                            <TableCell>
                                <Button variant="outlined" color="secondary"
                                        onClick={() => handleDeleteInvestment(inv.id)}>
                                    Видалити
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default InvestmentsPage;
