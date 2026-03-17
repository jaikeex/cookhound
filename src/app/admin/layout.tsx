import React from 'react';
import { AdminLayoutShell } from '@/client/components';

export default async function AdminLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
