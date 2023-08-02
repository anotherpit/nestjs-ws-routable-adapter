import {Logger} from '@nestjs/common'
import {WsAdapter} from '@nestjs/platform-ws'
import {MessageMappingProperties} from '@nestjs/websockets'
import {EMPTY, Observable} from 'rxjs'

/**
 * Extended version of {@link WsAdapter} that supports parameterized message routing similar to HTTP.
 *
 * TODO: documentation
 */
export class WsRoutableAdapter extends WsAdapter {
  protected override readonly logger = new Logger(WsRoutableAdapter.name)

  public override bindMessageHandler(
    buffer: {data: string},
    handlers: MessageMappingProperties[],
    transform: (data: unknown) => Observable<unknown>,
  ): Observable<unknown> {
    try {
      const message = JSON.parse(buffer.data)
      let params: Record<string, string> = {}

      const messageHandler = handlers.find(
        (handler) => {
          if (handler.message instanceof Object) {
            const matches = handler.message.regexp.exec(message.event)
            if (matches === null) {
              return false
            }
            params = handler.message.keys.reduce(
              (result, key, index) => {
                return {
                  ...result,
                  [key.name]: matches[1 + index],
                }
              },
              {},
            )
            return true
          } else {
            return handler.message === message.event
          }
        },
      )

      const { callback } = messageHandler
      return transform(callback(message.data, message.event, params))
    } catch {
      return EMPTY
    }
  }
}


