import {MESSAGE_MAPPING_METADATA, MESSAGE_METADATA} from "@nestjs/websockets/constants";
import * as pathToRegexp from "path-to-regexp";

/**
 * Route handler method decorator. Subscribes to messages that match the given route.
 *
 * Route-aware analog of {@link SubscribeMessage} for {@link WsRoutableAdapter}
 */
export const WsRouteSubscribe = <TRoute extends pathToRegexp.Path = pathToRegexp.Path>(route: TRoute): MethodDecorator => {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata(MESSAGE_MAPPING_METADATA, true, descriptor.value)
    const keys = []
    const regexp = pathToRegexp(route, keys)
    const message = {
      regexp,
      keys,
      toString: () => route,
    }
    Reflect.defineMetadata(MESSAGE_METADATA, message, descriptor.value)
    return descriptor
  }
}
