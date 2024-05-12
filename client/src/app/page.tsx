'use client';

import api from '@/service/api/counter';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    FormHelperText,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { MouseEvent, useEffect, useState } from 'react';

export default function Home() {
    // Settings Menu
    const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
    const open = !!settingsAnchor;
    const handleMenuClick = (e: MouseEvent<HTMLButtonElement>) => setSettingsAnchor(e.currentTarget);
    const handleMenuClose = () => setSettingsAnchor(null);

    // Counter
    const [counter, setCounter] = useState<null | number>(null);
    useEffect(() => {
        setCounter(null);
        api.getCurrentCount()
            .then((res) => setCounter(res.data))
            .catch((err: AxiosError) => setError(err.response?.data as string));
    }, []);

    const handleDecrement = () => {
        setError(null);
        api.decrementCount()
            .then((res) => setCounter(res.data))
            .catch((err: AxiosError) => setError(err.response?.data as string));
    };

    const handleReset = () => {
        setError(null);
        api.resetCounter()
            .then((res) => setCounter(res.data))
            .catch((err: AxiosError) => setError(err.response?.data as string))
            .finally(() => handleMenuClose());
    };

    // Errors
    const [error, setError] = useState<null | string>(null);

    return (
        <main>
            <Stack justifyContent="center" alignItems="center" sx={{ width: '100vw', height: '100vh' }}>
                <Card sx={{ minWidth: 400 }}>
                    <CardHeader
                        title="Cameras Remaining"
                        action={
                            <IconButton
                                id="settings"
                                aria-controls={open ? 'settings-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                aria-label="settings"
                                onClick={handleMenuClick}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        }
                    />
                    <CardContent sx={{ py: 3 }}>
                        <Stack alignItems="center" spacing={2}>
                            {counter !== null ? (
                                <Typography variant="h2">{counter}</Typography>
                            ) : (
                                <CircularProgress size={72} />
                            )}
                            {error && (
                                <FormHelperText error sx={{ mt: 1, textAlign: 'center' }}>
                                    {error}
                                </FormHelperText>
                            )}
                        </Stack>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Button variant="outlined" onClick={handleDecrement} disabled={!counter}>
                            {counter === 0 ? 'Sold Out!' : 'Sell Camera'}
                        </Button>
                    </CardActions>
                </Card>
            </Stack>
            <Menu
                id="settings-menu"
                anchorEl={settingsAnchor}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{ 'aria-labelledby': 'settings' }}
            >
                <MenuItem onClick={handleReset}>Reset counter</MenuItem>
            </Menu>
        </main>
    );
}
