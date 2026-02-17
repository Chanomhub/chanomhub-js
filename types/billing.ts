/**
 * Chanomhub SDK - Billing Types
 */

export interface TrackUsageRequest {
    /**
     * The event code to track (e.g., 'mod-download')
     */
    code: string;

    /**
     * Additional properties for the event
     */
    properties?: Record<string, any>;
}

export interface TrackUsageResponse {
    /**
     * Whether the tracking was successful
     */
    success: boolean;

    /**
     * Internal Lago event ID or transaction ID
     */
    transactionId?: string;
}
