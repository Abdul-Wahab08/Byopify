import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";


type AuthLayoutProps = {
    authentication?: boolean;
    children: React.ReactNode
}
function AuthLayout({ authentication = true, children }: AuthLayoutProps) {

    const { isSignedIn, isLoaded } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoaded) return

        if (authentication && authentication !== isSignedIn) {
            navigate('/')
        }
    }, [authentication, isSignedIn, navigate])

    return (
        <>
            {children}
        </>
    )
}

export default AuthLayout
