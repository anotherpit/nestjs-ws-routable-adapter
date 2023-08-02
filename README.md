# WsRoutableAdapter for [NestJS](https://nestjs.com/)

Extended version on NestJs' WsAdapter that supports route parameters,
similar to those of HTTP controllers:

## Usage 

`gateway.ts`
```typescript
// Regular gateway definition
@WebSocketGateway({ path: '/' })
export class TestGateway {
  // Route-aware analog of @SubscribeMessage(...)
  @WsRouteSubscribe('ping/:param')
  onPing(
    @MessageBody() data,
    // New decorator to get the full route
    @WsRoute() route,
    // Route-aware analog of @Param(...)
    @WsRouteParam('param') param,
    @WsRouteParam('missingParam') missingParam,
  ) {
    return {
      event: 'pong',
      data: {
        data,
        route,
        param
      },
    };
  }
}
```

`main.ts`
```typescript
async function bootstrap(): Promise<void> {
  // ...
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsRoutableAdapter(app));
  // ...
}
```

Now if you send 
```json 
{ 
  "event": "ping/42", 
  "data": "data"
}
```

gateway will responde with
```json
{
  "event": "pong",
  "data": {
    "data": "data",
    "route": "ping/42",
    "param": "42"
  }
}
```


## Versioning

Since this library extends the build-in [WsAdapter](https://docs.nestjs.com/websockets/adapter#ws-library) 
from [the `@nestjs/platform-ws` package](https://www.npmjs.com/package/@nestjs/platform-ws), 
versioning of this library will follow versioning of NestJs (patch versions might differ).  
