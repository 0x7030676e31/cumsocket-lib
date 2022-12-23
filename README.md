# Cumsocket
Cumsocket is a simple Discord selfbot library based on pure websocket and node-fetch. It's designed to use modules as event receivers to easily add own modules.

## About / Worth Mentioning
- Cumsocket is mainly designed for personal use but I made it public anyway.
- Library is ES Module only and it should be used with TypeScript because of decorators.
- It has a PostgreSQL built-in because I had to integrate it with heroku postgres.
- Api wrapper is still in development has only a few parts of the api implemented.
- It's designed to be safe but there is no `science` and `cookie` support yet.
- Selfbotting is forbidden by Discord's TOS and you can get banned for it. Using it on your main account is not recommended.

## Installation
```bash
npm install cumsocket
```

## Usage
```ts
import { Client, Module, EnvConfig } from 'cumsocket';

// Create a new client instance
const client = new Client({ authorization: process.env.TOKEN });

// Register a module
client.loadModule(class MyModule extends Module {
  public readonly id: string = 'myModule';
  public readonly ctx!: Client;
  public readonly env: EnvConfig = {
    example_var_1: "string",
    example_var_2: "number",
    example_var_3: "boolean",
  };

  // public readonly env: EnvConfig = ["example_var_1", "example_var_2"];
  // public readonly ignore: boolean = true;

  // Called when the module is loaded
  public async init(ctx: Client): Promise<void> {
    Client.log('MyModule', 'Module initialized');
    const exampleVar1: string = this.env('example_var_1');
    const exampleVar2: number = this.env('example_var_2');
    const exampleVar3: boolean = this.env('example_var_3');
  }

  // Called when the client is ready
  public async ready(ctx: Client): Promise<void> {
    Client.log('MyModule', 'Client ready');
  }

  // Called when the client receives a MESSAGE_CREATE event
  @Client.listen("MESSAGE_CREATE")
  public async onMessage(data: any): Promise<void> {
    Client.log('MyModule', 'Message received');
  }

  // Called when the client receives a MESSAGE_UPDATE or MESSAGE_DELETE event
  @Client.listen("MESSAGE_UPDATE", "MESSAGE_DELETE")
  public async onMessageUpdateOrDelete(data: any): Promise<void> {
    Client.log('MyModule', 'Message updated or deleted');
  }
});
```
## TODO:
- Documentation
- More examples