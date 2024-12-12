import {
  type Analytics,
  type EventProperties,
  type MiddlewareFunction,
  type UserTraits,
} from "@segment/analytics-next";
import { getAppsmithConfigs } from "ee/configs";
import log from "loglevel";

class SegmentSingleton {
  private static instance: SegmentSingleton;
  private analytics: Analytics | null = null;

  public static getInstance(): SegmentSingleton {
    if (!SegmentSingleton.instance) {
      SegmentSingleton.instance = new SegmentSingleton();
    }

    return SegmentSingleton.instance;
  }

  public user = this.analytics?.user;

  private getWriteKey(): string | undefined {
    const { segment } = getAppsmithConfigs();

    // This value is only enabled for Appsmith's cloud hosted version. It is not set in self-hosted environments
    if (segment.apiKey) {
      return segment.apiKey;
    }

    // This value is set in self-hosted environments. But if the analytics are disabled, it's never used.
    if (segment.ceKey) {
      return segment.ceKey;
    }
  }

  public async init(): Promise<boolean> {
    if (this.analytics) {
      log.warn("Segment is already initialized.");

      return true;
    }

    const writeKey = this.getWriteKey();

    if (!writeKey) {
      log.error("Segment key was not found.");

      return true;
    }

    try {
      const { AnalyticsBrowser } = await import("@segment/analytics-next");
      const [analytics] = await AnalyticsBrowser.load(
        { writeKey },
        {
          integrations: {
            "Segment.io": {
              deliveryStrategy: {
                strategy: "batching", // The delivery strategy used for sending events to Segment
                config: {
                  size: 100, // The batch size is the threshold that forces all batched events to be sent once it’s reached.
                  timeout: 1000, // The number of milliseconds that forces all events queued for batching to be sent, regardless of the batch size, once it’s reached
                },
              },
            },
          },
        },
      );

      this.analytics = analytics;

      return true;
    } catch (error) {
      log.error("Failed to initialize Segment:", error);

      return false;
    }
  }

  public track(eventName: string, eventData: EventProperties) {
    if (this.analytics) {
      this.analytics.track(eventName, eventData);
    } else {
      log.warn("Segment is not initialized.");
    }
  }

  public async identify(userId: string, traits: UserTraits) {
    if (this.analytics) {
      await this.analytics.identify(userId, traits);
    } else {
      log.warn("Segment is not initialized.");
    }
  }

  public async addMiddleware(middleware: MiddlewareFunction) {
    if (this.analytics) {
      await this.analytics.addSourceMiddleware(middleware);
    } else {
      log.warn("Segment is not initialized.");
    }
  }

  public page(name?: string, properties?: EventProperties) {
    if (this.analytics) {
      this.analytics.page(name, properties);
    } else {
      log.warn("Segment is not initialized.");
    }
  }

  public reset() {
    if (this.analytics) {
      this.analytics.reset();
    } else {
      log.warn("Segment is not initialized.");
    }
  }
}

export default SegmentSingleton;
