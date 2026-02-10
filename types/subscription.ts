/**
 * Chanomhub SDK - Subscription Types
 */

/** Subscription status */
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'SUSPENDED' | 'PAST_DUE' | 'UNPAID';

/** Payment method */
export type PaymentMethod = 'POINTS' | 'TRUEMONEY' | 'SLIP2GO';

/** Subscription entity */
export interface Subscription {
    id: number;
    userId: number;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    startDate: string;
    endDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Subscription plan entity */
export interface SubscriptionPlan {
    planId: string;
    name: string;
    description?: string | null;
    pointsCost: number;
    durationDays: number;
    roleId: number;
    isActive: boolean;
}

/** Request to create a new subscription */
export interface CreateSubscriptionRequest {
    planId: string;
    paymentMethod?: PaymentMethod;
}

/** Request to create a new subscription plan */
export interface CreateSubscriptionPlanRequest {
    planId: string;
    name: string;
    description?: string;
    pointsCost: number;
    durationDays: number;
    roleId: number;
    isActive?: boolean;
}

/** Response for subscription plan creation */
export interface SubscriptionPlanResponse {
    plan: SubscriptionPlan;
}

/** Response for subscription creation */
export interface SubscriptionResponse {
    subscription: Subscription;
}

/** List of user subscriptions */
export interface SubscriptionsListResponse {
    subscriptions: Subscription[];
}

/** List of subscription plans */
export interface SubscriptionPlansListResponse {
    plans: SubscriptionPlan[];
}
