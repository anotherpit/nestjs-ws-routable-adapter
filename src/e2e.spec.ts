import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { afterEach } from 'mocha';
import { WsRoute } from './decorators/ws-route';
import { WsRouteParam } from './decorators/ws-route-param';
import { WsRouteSubscribe } from './decorators/ws-route-subscribe';
import { WsRoutableAdapter } from './ws-routable-adapter';
import request from 'superwstest';

@WebSocketGateway({ path: '/' })
export class TestGateway {
  @WsRouteSubscribe('ping/:param')
  onPing(
    @MessageBody() data,
    @WsRoute() route,
    @WsRouteParam('param') param,
    @WsRouteParam('missingParam') missingParam,
  ) {
    return {
      event: 'pong',
      data: {
        data,
        route,
        param,
        missingParam,
      },
    };
  }
}

describe(WsRoutableAdapter.name, () => {
  let app: INestApplication;

  beforeEach(async () => {
    const testingModule = await Test.createTestingModule({
      providers: [TestGateway],
    }).compile();

    app = testingModule.createNestApplication();
    app.useWebSocketAdapter(new WsRoutableAdapter(app));

    await app.listen(4242);
  });

  afterEach(async () => {
    return await app.close();
  });

  it('should work', () =>
    request(app.getHttpServer())
      .ws('/')
      .sendJson({ event: 'ping/42', data: 'data' })
      .expectJson({
        event: 'pong',
        data: {
          data: 'data',
          route: 'ping/42',
          param: '42',
        },
      })
      .close()
      .expectClosed());
});
