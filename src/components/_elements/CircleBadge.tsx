import React from "react";
import {Box, Tooltip} from "@mui/material";

const CircleBadge = ({
                         children,
                         color = "secondary.main",
                         sx = {},
                         title = 'За весь час'
                     }: {
    children: React.ReactNode;
    color?: string;
    sx?: object;
}) => {
    return (
        <Tooltip title={title}>
            <Box display="flex" alignItems="center" gap={1}>
                <Box
                    sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: color,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        ...sx
                    }}
                >
                    {children}
                </Box>
            </Box></Tooltip>
    );
};

export default CircleBadge