import { authService } from '@/server/services/auth/service';

export async function POST() {
    await authService.logout();

    return Response.json({ message: 'Logged out successfully' });
}
