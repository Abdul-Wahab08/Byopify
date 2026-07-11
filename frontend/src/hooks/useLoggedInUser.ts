import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../lib/fetchApi";

export function useLoggedInUser() {
    const { isSignedIn, getToken } = useAuth();

    const { data: response, isLoading } = useQuery({
        queryKey: ['loggedInUser'],
        queryFn: () => fetchApi('/me', { getToken }),
        enabled: isSignedIn
    })

    return { response, isLoading }
}