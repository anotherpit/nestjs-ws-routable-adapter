import {ExecutionContext} from "@nestjs/common";
import {assignCustomParameterMetadata} from "@nestjs/common/utils/assign-custom-metadata.util";
import {PARAM_ARGS_METADATA} from "@nestjs/websockets/constants";

export const WS_ROUTE = 'WsRoute'

/**
 * Route handler parameter decorator. Extracts full route value from the message.
 *
 * Route-aware analog of {@link Param} for {@link WsRoutableAdapter}
 */
export function WsRoute(): ParameterDecorator {
  return function (target, key, index) {
    // Get existing metadata of the handler
    const args = Reflect.getMetadata(PARAM_ARGS_METADATA, target.constructor, key) || {}
    // Extend with new metadata
    const meta = assignCustomParameterMetadata(args, WS_ROUTE, index, (data, input: ExecutionContext) => {
      /**
       * Input is the execution context of the callback as specified by adapter,
       * so in case of {@link WsRoutableAdapter} arguments are: {@link WebSocket}, payload, and then params
       */
      return input.getArgByIndex<Record<string, string>>(2)
    })
    // Save extended metadata
    Reflect.defineMetadata(PARAM_ARGS_METADATA, meta, target.constructor, key)
  }
}
