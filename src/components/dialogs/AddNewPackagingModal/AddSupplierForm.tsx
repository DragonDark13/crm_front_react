import {axiosInstance} from "../../../api/api";
import {useState} from "react";
import {Box, Button, CircularProgress, TextField, Typography} from "@mui/material";

const AddSupplierForm = ({handleClose}: { handleClose: () => void }) => {
    const [name, setName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axiosInstance.post("/add_new_packaging_suppliers", {
                name,
                contact_info: contactInfo,
            });
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{maxWidth: 400, mx: "auto", mt: 4}}>
            <TextField
                label="Supplier Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Contact Info"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                fullWidth
                margin="normal"
            />
            {error && (
                <Typography color="error" variant="body2" mb={2}>
                    {error}
                </Typography>
            )}
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24}/> : "Додати"}
            </Button>
        </Box>
    );
};

export default AddSupplierForm;
