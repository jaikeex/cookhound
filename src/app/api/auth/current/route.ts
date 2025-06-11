import { authService } from '@/server/services/auth/service';

export async function GET() {
    const user = await authService.getCurrentUser();

    if (!user) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return Response.json(user);
}
