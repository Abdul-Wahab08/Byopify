import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { fetchApi } from "../lib/fetchApi";
import type { orders } from "../types/types";
import { useEffect, useState } from "react";
import { Call, StreamVideoClient } from "@stream-io/video-react-sdk";

export function useOrderVideoPage() {
    const [client, setClient] = useState<StreamVideoClient | null>(null)
    const [call, setCall] = useState<Call | null>(null)
    const [error, setError] = useState<string | null>(null)

    const { id } = useParams();
    const { isSignedIn, getToken } = useAuth();

    const { data: orderDetails, isLoading, error: orderError } = useQuery({
        queryKey: ['orderDetails', id],
        queryFn: () => fetchApi(`/orders/get-order-by-id/${id}`, { getToken }),
        enabled: Boolean(id)
    })

    const order: orders = orderDetails?.data?.order;
    const paid = order?.status === "paid";

    useEffect(() => {
        if (!id || !paid || !isSignedIn) return

        let videoClient: StreamVideoClient;
        let activeCall: Call;

        async function connectOrderVideoCall() {
            const tokenResponse = await fetchApi("/stream/create-token",
                {
                    getToken,
                    method: "POST"
                }
            )

            const token = tokenResponse?.data;
            if (!token) return

            videoClient = new StreamVideoClient({
                apiKey: token.apikey,
                user: {
                    id: token.id,
                    name: token.name
                },
                token: token.token
            })

            activeCall = videoClient.call("default", `order-${id}`)
            await activeCall.join({ create: true })

            setClient(videoClient)
            setCall(activeCall)

        }

        connectOrderVideoCall().catch((err) => {
            setError(err instanceof Error ? err.message : "Something went wrong with the video call")
        })

        return () => {
            if (activeCall) activeCall.leave()
            if (videoClient) videoClient.disconnectUser()
        }

    }, [id, paid, getToken, isSignedIn])

    return {
        paid,
        order,
        client,
        call,
        error,
        isLoading,
        orderError
    }
}
