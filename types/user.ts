export interface User {
    authenticated: boolean;
    id: string;
    email: string;
    user_roles: string[];
    username: string;
}