// src/acl/acl.tsx
import {ACLProvider} from 'react-acl';
import React from "react";

// Define your roles
const roles = ['guest', 'manager']; // Add roles according to your needs

const ACLContextProvider: React.FC = ({children}) => {
    return (
        <ACLProvider roles={roles} user={{role: 'manager'}}> {/* Assume the user role is 'manager' */}
            {children}
        </ACLProvider>
    );
};

export default ACLContextProvider;
