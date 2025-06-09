import React from 'react';
import {TableCell, TableSortLabel, Typography} from "@mui/material";


interface IRenderHeaderCellProps extends TableCell{
    children: string;
    sortKey?: string;
    orderBy?: string;
    sortOrder?: 'asc' | 'desc';
    handleRequestSort?: (key: string) => void;
}

const RenderHeaderCell: React.FC<IRenderHeaderCellProps> = ({
    sortKey,
    orderBy,
    sortOrder,
    handleRequestSort,
    children,
    ...rest
}) => {
    const isSortable = Boolean(sortKey);

    return (
        <TableCell {...rest}>
            <Typography>
                {isSortable ? (
                    <TableSortLabel
                        active={orderBy === sortKey}
                        direction={orderBy === sortKey ? sortOrder : 'asc'}
                        onClick={ () => {
                            handleRequestSort ?
                            handleRequestSort(sortKey!)
                                : null
                        }}
                    >
                        {children}
                    </TableSortLabel>
                ) : (
                    children
                )}
            </Typography>
        </TableCell>
    );
};


export default RenderHeaderCell;
