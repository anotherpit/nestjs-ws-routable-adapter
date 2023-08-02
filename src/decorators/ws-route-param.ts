import {ExecutionContext, PipeTransform} from "@nestjs/common";
import {Type} from "@nestjs/common/interfaces";
import {assignCustomParameterMetadata} from "@nestjs/common/utils/assign-custom-metadata.util";
import {PARAM_ARGS_METADATA} from "@nestjs/websockets/constants";

export const WS_ROUTE_PARAM = 'WsRouteParam'

/**
 * Route handler parameter decorator. Extracts param value from the route of the message.
 * May also apply pipes to the bound parameter.
 *
 * Route-aware analog of {@link Param} for {@link WsRoutableAdapter}
 */
export function WsRouteParam(property: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator {
  return function (target, key, index) {
    // Get existing metadata of the handler
    const args = Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {}
    // Extend with new metadata
    const meta = assignCustomParameterMetadata(args, WS_ROUTE_PARAM, index, (data, input: ExecutionContext) => {
      /**
       * Input is the execution context of the callback as specified by adapter,
       * so in case of {@link WsRoutableAdapter} arguments are: {@link WebSocket}, payload, route, and then params
       */
      return input.getArgByIndex<Record<string, string>>(3)[property]
    }, undefined, ...pipes)
    // Save extended metadata
    Reflect.defineMetadata(PARAM_ARGS_METADATA, meta, target.constructor, key)
  }
}
