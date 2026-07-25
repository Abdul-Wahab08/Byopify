import { useAuth } from "@clerk/react";
import { fetchApi } from "../lib/fetchApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { User } from "../types/types";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export function useOrderChatPage() {
    const [client, setClient] = useState<StreamChat | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { isSignedIn, getToken } = useAuth()
    const { id } = useParams()

    const { data: userData } = useQuery({
        queryKey: ['loggedInUser'],
        queryFn: () => fetchApi('/me', { getToken }),
        enabled: isSignedIn
    })

    const user: User = userData?.data;

    const inviteMutation = useMutation({
        mutationFn: () => fetchApi(`/orders/${id}/send-video-invite`,
            {
                getToken,
                method: "POST"
            }
        )
    })

    useEffect(() => {
        if (!id || !user) return

        async function createChatToken() {
            await fetchApi(`/orders/${id}/create-stream-chat-channel`,
                {
                    getToken,
                    method: "POST"
                }
            )

            const tokenResponse = await fetchApi("/stream/create-token",
                {
                    getToken,
                    method: "POST"
                }
            )

            const token = tokenResponse?.data;
            const orderChatClient = StreamChat.getInstance(token?.apikey)

            await orderChatClient.connectUser({
                id: token.id,
                name: token.name
            }, token.token)

            const channel = orderChatClient.channel("messaging", `order-${id}`)

            await channel.watch()
            setClient(orderChatClient)
        }

        createChatToken().catch((err) => {
            setError(err instanceof Error ? err.message : "Error occurs while creating chat token")
        })

        return () => {
            if (client) {
                client.disconnectUser()
            }
        }
    }, [id, getToken, user])

    const channel = client && id ? client.channel("messaging", `order-${id}`) : null
    const isStaff = user.role === "admin" || user.role === "support";

    return {
        client,
        channel,
        isStaff,
        error,
        inviteMutation
    }
}