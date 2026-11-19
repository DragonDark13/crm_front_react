import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import {BrowserRouter} from 'react-router-dom';
import {AppProviders} from './components/Provider/AppProviders';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <AppProviders>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </AppProviders>
);
