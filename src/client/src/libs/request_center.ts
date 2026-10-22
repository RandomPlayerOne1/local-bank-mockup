
// src/client/src/libs/request_center.ts

const DEFAULT_SERVER_URL = "http://localhost"
const DEFAULT_SERVER_PORT = 3000

const REQ_URL = DEFAULT_SERVER_URL + ":" + DEFAULT_SERVER_PORT

interface RequestOptions {
    maxRequest?: number; //How many request are allowed on same URL at the same time until it resolve.
    simulateLatency?: number; // Delay in milliseconds
    authenticate?: boolean //Sending authentication token in header
    raw_response?: boolean //Return raw response
}

interface UserCredential {
    "userAccessToken"?: string;
    "userRefreshToken"?: string;
    "user"?: string
}

interface RequestEx extends RequestInit {
    preset?: "post/app/json"
}

let ActiveRequests: Record<string, number | undefined> = {};

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function GetUserCredential({ mustValid }: { mustValid?: boolean }): UserCredential | null {
    if (mustValid) {
        if (!IsAuthenticated()) return null;
    }

    return {
        "userAccessToken": localStorage.getItem("userAccessToken") ?? "",
        "userRefreshToken": localStorage.getItem("userRefreshToken") ?? "",
        "user": localStorage.getItem("user") ?? ""
    }
}

function IsAuthenticated(): boolean {
    const userAccessToken = localStorage.getItem("userAccessToken");
    const userRefreshToken = localStorage.getItem("userRefreshToken");
    const user = localStorage.getItem("user");

    return (userAccessToken != null && userRefreshToken != null && user != null)
}

//Generate Auth header based on current user data
function GenerateTokenString(): string {
    const credential = GetUserCredential({ mustValid: true })

    if (credential == null) return "";

    return `Bearer ${credential.userAccessToken} Refresher ${credential.userRefreshToken}`
}

async function DoLogOut(): Promise<Response> {
    const res = await ServerRequest<Response>("/public_api/user_identity/logout", {
        method: "DELETE"
    }, { authenticate: true, maxRequest: 1, raw_response: true });

    if (res.ok) {
        //Handle clean up
        localStorage.removeItem("userAccessToken");
        localStorage.removeItem("userRefreshToken");
        localStorage.removeItem("user");
    }

    return res
}

//Main Request Function
async function ServerRequest<T = unknown>(url: string, reqData: RequestEx, options?: RequestOptions): Promise<T> {
    const fullPath = REQ_URL + url;

    const maxRequest = options?.maxRequest ?? -1;
    const curQueues = ActiveRequests[fullPath] ?? 0;
    const preset = reqData.preset;
    const headers = new Headers(reqData.headers);


    if (maxRequest > 0 && curQueues >= maxRequest) {
        throw new Error("Too Many Requests")
    }

    ActiveRequests[fullPath] = curQueues + 1;

    if (options?.authenticate) {
        headers.set('Authorization', GenerateTokenString())
    }

    if (preset != null) {
        switch (preset) {
            case "post/app/json":
                reqData.method = 'POST';
                headers.set("Content-Type", "application/json");
        }

    }

    reqData.headers = headers

    try {
        // Simulate network latency for testing
        if (options?.simulateLatency) {
            await delay(options.simulateLatency);
        }

        const response: Response = await fetch(fullPath, reqData);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        // Empty content
        if (response.status === 204) {
            return undefined as T;
        }

        if (options?.raw_response) return response as T

        return await response.json() as T
    } finally {
        //Cleaning up when there is no more request
        const remaining = (ActiveRequests[fullPath] ?? 1) - 1;

        if (remaining <= 0) {
            delete ActiveRequests[fullPath];
        } else {
            ActiveRequests[fullPath] = remaining;
        }
    }
}

export {
    ServerRequest,
    IsAuthenticated,
    GetUserCredential,
    DoLogOut
}

export type {
    UserCredential
}