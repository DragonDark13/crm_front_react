import React, {useEffect, useState} from "react";
import {Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area,
    LineChart, Line, LabelList,
} from "recharts";
import {axiosInstance} from "../../api/api.ts";

const MONTH_NAMES = [
    "Січень", "Лютий", "Березень", "Квітень",
    "Травень", "Червень", "Липень", "Серпень",
    "Вересень", "Жовтень", "Листопад", "Грудень"
];


// Типи даних
interface MonthlyData {
    month: number;
    total_sales?: number;
    total_spent?: number;
    total_quantity?: number;
    profit?: number;
    sales?: number;
    expenses?: number;

    [key: string]: any;
}

interface TopProduct {
    product_id: number;
    name: string;
    total_sold: number;
    total_sales: number;
}

interface StockLevel {
    id: number;
    name: string;
    available_quantity: number;
    total_quantity: number;
}

interface CustomerActivity {
    day: string;
    active_customers: number;
}


export default function Dashboard() {
    const [monthlySales, setMonthlySales] = useState<MonthlyData[]>([]);
    const [monthlyPurchases, setMonthlyPurchases] = useState<MonthlyData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
    const [profitExpenses, setProfitExpenses] = useState<MonthlyData[]>([]);
    const [customerActivity, setCustomerActivity] = useState<CustomerActivity[]>([]);


    useEffect(() => {
        async function fetchData() {
            const salesRes = await axiosInstance.get("/statistics/sales/monthly");
            const purchasesRes = await axiosInstance.get("/statistics/purchases/monthly");
            const topProductsRes = await axiosInstance.get("/statistics/top-products");
            const stockRes = await axiosInstance.get("/statistics/stock");
            const profitRes = await axiosInstance.get("/statistics/profit-expense");
            const activityRes = await axiosInstance.get("/statistics/customer-activity");

            setMonthlySales((salesRes.data as MonthlyData[]).map(item => ({
                ...item,
                monthName: MONTH_NAMES[item.month - 1]
            })));
            setMonthlyPurchases((purchasesRes.data as MonthlyData[]).map(item => ({
                ...item,
                monthName: MONTH_NAMES[item.month - 1]
            })));
            setProfitExpenses((profitRes.data as MonthlyData[]).map(item => ({
                ...item,
                monthName: MONTH_NAMES[item.month - 1]
            })));

            setTopProducts(topProductsRes.data);
            setStockLevels(stockRes.data);
            setCustomerActivity(activityRes.data);
        }

        fetchData();
    }, []);

    const adjustedProfitExpenses = profitExpenses.length === 1
        ? [
            {monthName: "Start", sales: 0, expenses: 0, profit: 0}, // фіктивна стартова точка
            ...profitExpenses
        ]
        : profitExpenses;


    const adjustedCustomerActivity = customerActivity.length > 0
  ? [{ day: "Start", active_customers: 0 }, ...customerActivity]
  : customerActivity;

    return (
        <Box sx={{flex: 1, marginLeft: '80px', padding: 3}}>
            <Typography variant="h4" gutterBottom>Dashboard Statistics</Typography>

            <Grid container spacing={3}>
                {/* Продажі по місяцях */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Продажі по місяцях</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlySales}>
                                <XAxis dataKey="monthName"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>

                                {/* Продажі по сумі */}
                                <Bar barSize={30} dataKey="total_sales" fill="#4caf50" name="Продажі">
                                    <LabelList
                                        dataKey="total_sales"
                                        position="top"
                                        content={(props) => {
                                            const {x, y, width, value, index} = props;
                                            const quantity = monthlySales[index]?.total_quantity ?? 0;
                                            return (
                                                <text x={x! + width! / 2} y={y! - 5} textAnchor="middle" fill="#000">
                                                    ${value} / {quantity}
                                                </text>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Закупки по місяцях */}
                <Grid item xs={12} md={12}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Закупки по місяцях</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyPurchases}
                                      width={150} height={40}

                            >
                                <XAxis dataKey="monthName"/>
                                <YAxis/>
                                <Legend/>

                                <Bar dataKey="total_spent" fill="#f44336" name="Сума закупок">
                                    <LabelList
                                        dataKey="total_spent"
                                        position="top"
                                        content={(props) => {
                                            const {x, y, width, value, index} = props;
                                            // Витягуємо кількість закуплених одиниць для підпису
                                            const quantity = monthlyPurchases[index]?.total_quantity ?? 0;
                                            return (
                                                <text x={x! + width! / 2} y={y! - 5} textAnchor="middle" fill="#000">
                                                    ${value} / {quantity}
                                                </text>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Топ-10 товарів */}
                <Grid item xs={12} md={12}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Топ-10 товарів</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={topProducts} barGap={10} barCategoryGap="20%">
                                <XAxis dataKey="name"/>
                                <YAxis allowDecimals={false}/> {/* тільки цілі числа */}
                                <Tooltip/>
                                <Legend/>

                                <Bar dataKey="total_sold" fill="#1976d2" name="Продані одиниці" barSize={40}>
                                    <LabelList
                                        dataKey="total_sold"
                                        position="top"
                                        content={(props) => {
                                            const {x, y, width, value, index} = props;
                                            const productName = topProducts[index]?.name ?? "";
                                            return (
                                                <text x={x! + width! / 2} y={y! - 10} textAnchor="middle" fill="#000">
                                                    {productName} / {Math.round(value)}
                                                </text>
                                            );
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Залишки товарів */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Залишки товарів</Typography>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Товар</TableCell>
                                    <TableCell align="right">Доступно</TableCell>
                                    <TableCell align="right">Всього</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stockLevels.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell
                                            align="right"
                                            style={{
                                                color: row.available_quantity < 50 ? "red" :
                                                    row.available_quantity < 150 ? "orange" : "green",
                                            }}
                                        >
                                            {row.available_quantity}
                                        </TableCell>
                                        <TableCell align="right">{row.total_quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                {/* Прибуток / Витрати */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Прибуток / Витрати</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={adjustedProfitExpenses}>
                                <XAxis dataKey="monthName"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                <Area type="monotone" dataKey="sales" fill="#a5d6a7" stroke="#4caf50" name="Продажі"/>
                                <Area type="monotone" dataKey="expenses" fill="#ef9a9a" stroke="#f44336"
                                      name="Витрати"/>
                                <Area type="monotone" dataKey="profit" fill="#90caf9" stroke="#2196f3" name="Прибуток"/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Активність клієнтів */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{padding: 2}}>
                        <Typography variant="h6">Активність клієнтів</Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={adjustedCustomerActivity} margin={{top: 20, right: 20, left: 10, bottom: 20}}>
                                <XAxis dataKey="day" interval={0}/> {/* interval={0} показує всі дні */}
                                <YAxis allowDecimals={false}/> {/* тільки цілі числа */}
                                <Tooltip formatter={(value: number) => `${value} клієнтів`}/>
                                <Legend/>
                                <Line
                                    type="monotone"
                                    dataKey="active_customers"
                                    stroke="#1976d2"
                                    strokeWidth={2}
                                    name="Активні клієнти"
                                    dot={{r: 5}}  // робимо точки помітними
                                    activeDot={{r: 7}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
