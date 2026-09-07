---
title: "Design Patterns"
date: 2025-01-15
tags:
  - design-patterns
  - software-architecture
description: "Notes and presentation outline about design patterns, their intent, trade-offs, and related connections."
---

## Presentation Intent

Prepare the presentation with a clear script of intentions.

Explain how to read the book and how, by recognizing similar patterns, you create connections between them and discover different perspectives on the same problem. In some cases, this leads to other ways—or better ways—to apply a different pattern.

Another pattern can sometimes feel very similar to the one you are reading. The point is to think beyond the current chapter and compare intent, structure, and trade-offs.

State this explicitly during the presentation:

- We will not cover every pattern with examples.
- We will focus on a selected group of patterns.
- The goal is not memorization, but understanding intent and pattern selection.

## Decorator

Decorator is useful when you want to change behavior without changing the base implementation.

A related pattern is **Chain of Responsibility**, which can achieve similar goals in some flows. The main difference is:

- **Decorator** wraps behavior and keeps composition around the base object.
- **Chain of Responsibility** can stop propagation and interrupt the flow.

### Example

A notification service can be extended with logging and metrics without changing the original service.

```typescript
interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  send(message: string): void {
    console.log(`Sending email: ${message}`);
  }
}

class NotifierDecorator implements Notifier {
  constructor(protected wrappee: Notifier) {}

  send(message: string): void {
    this.wrappee.send(message);
  }
}

class LoggingNotifier extends NotifierDecorator {
  send(message: string): void {
    console.log("Logging before send");
    super.send(message);
  }
}

class MetricsNotifier extends NotifierDecorator {
  send(message: string): void {
    console.log("Increment metrics");
    super.send(message);
  }
}

const notifier = new MetricsNotifier(new LoggingNotifier(new EmailNotifier()));
notifier.send("Hello");
```

## Chain of Responsibility

Chain of Responsibility is useful when multiple handlers may process a request, and any one of them can decide whether to continue or stop the flow.

### Example

With JWT validation:

- one handler checks authentication

- another checks permissions

- another executes the business action

```typescript
type Request = {
  user?: { id: string; role: string };
  token?: string;
};

abstract class Handler {
  private next?: Handler;

  setNext(handler: Handler): Handler {
    this.next = handler;
    return handler;
  }

  protected callNext(request: Request): void {
    if (this.next) this.next.handle(request);
  }

  abstract handle(request: Request): void;
}

class AuthHandler extends Handler {
  handle(request: Request): void {
    if (!request.token) {
      console.log("Unauthorized");
      return;
    }

    console.log("Authenticated");
    this.callNext(request);
  }
}

class PermissionHandler extends Handler {
  handle(request: Request): void {
    if (request.user?.role !== "admin") {
      console.log("Forbidden");
      return;
    }

    console.log("Authorized");
    this.callNext(request);
  }
}

class QueryHandler extends Handler {
  handle(_: Request): void {
    console.log("Executing query");
  }
}

const auth = new AuthHandler();
const permission = new PermissionHandler();
const query = new QueryHandler();

auth.setNext(permission).setNext(query);

auth.handle({
  token: "jwt-token",
  user: { id: "1", role: "admin" },
});
```

## Adapter

Adapter is useful when you already have an existing system and need a new interface without changing the original implementation.

### Example

Suppose the entire system serves XML, but now you need JSON.

You create an adapter that:

1. calls the original XML service

2. transforms the result

3. returns JSON to the caller

```typescript
class LegacyXmlService {
  fetchUserXml(): string {
    return `<user><id>1</id><name>Osmar</name></user>`;
  }
}

type User = {
  id: number;
  name: string;
};

class JsonUserAdapter {
  constructor(private legacyService: LegacyXmlService) {}

  fetchUser(): User {
    const xml = this.legacyService.fetchUserXml();

    return {
      id: Number(xml.match(/<id>(.*?)<\/id>/)?.[1] ?? 0),
      name: xml.match(/<name>(.*?)<\/name>/)?.[1] ?? "",
    };
  }
}

const adapter = new JsonUserAdapter(new LegacyXmlService());
console.log(adapter.fetchUser());
```

## Bridge

Bridge separates two class hierarchies that would otherwise be tightly coupled.

### Example

A remote control receives a `Device` in the constructor.

The `Device` abstraction is implemented by classes such as:

- `Radio`

- `TV`

Both implement commands expected by the remote.

```typescript
interface Device {
  power(): void;
  next(): void;
  previous(): void;
}

class TV implements Device {
  power(): void {
    console.log("TV power toggled");
  }

  next(): void {
    console.log("TV next channel");
  }

  previous(): void {
    console.log("TV previous channel");
  }
}

class Radio implements Device {
  power(): void {
    console.log("Radio power toggled");
  }

  next(): void {
    console.log("Radio next station");
  }

  previous(): void {
    console.log("Radio previous station");
  }
}

class RemoteControl {
  constructor(protected device: Device) {}

  togglePower(): void {
    this.device.power();
  }

  next(): void {
    this.device.next();
  }

  previous(): void {
    this.device.previous();
  }
}

class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    console.log("Muting device");
  }
}

const remote = new AdvancedRemoteControl(new TV());
remote.togglePower();
remote.next();
remote.mute();
```

## Proxy

Proxy is useful when you want to control access to an object without changing the original service.

### Example

You built an app without cache, and later you need caching.

A proxy can:

1. check whether a valid cached entry exists for an `id`

2. return the cached value if present

3. otherwise forward the request to the real service

```typescript
interface VideoService {
  getVideo(id: string): string;
}

class RealVideoService implements VideoService {
  getVideo(id: string): string {
    console.log("Fetching from remote service");
    return `video-${id}`;
  }
}

class CachedVideoProxy implements VideoService {
  private cache = new Map<string, string>();

  constructor(private service: VideoService) {}

  getVideo(id: string): string {
    if (this.cache.has(id)) {
      console.log("Returning from cache");
      return this.cache.get(id)!;
    }

    const video = this.service.getVideo(id);
    this.cache.set(id, video);
    return video;
  }
}

const service = new CachedVideoProxy(new RealVideoService());
console.log(service.getVideo("42"));
console.log(service.getVideo("42"));
```

## Composite

Composite relies on recursive composition.

A parent object can contain children, and the same operation can be applied recursively.

### Example

A `draw()` method may call `draw()` on child elements recursively.

```typescript
interface Graphic {
  draw(): void;
}

class Dot implements Graphic {
  constructor(
    private x: number,
    private y: number,
  ) {}

  draw(): void {
    console.log(`Draw dot at (${this.x}, ${this.y})`);
  }
}

class CompoundGraphic implements Graphic {
  private children: Graphic[] = [];

  add(child: Graphic): void {
    this.children.push(child);
  }

  draw(): void {
    console.log("Draw compound graphic");
    for (const child of this.children) {
      child.draw();
    }
  }
}

const group = new CompoundGraphic();
group.add(new Dot(1, 1));

const nestedGroup = new CompoundGraphic();
nestedGroup.add(new Dot(10, 10));
nestedGroup.add(new Dot(20, 20));

group.add(nestedGroup);
group.draw();
```

## Facade

Facade simplifies usage without changing the underlying classes.

### Example

Before using a facade, you might need to know exactly which video codec function to call and in what sequence.

With a facade:

- you pass the file

- the facade handles the internal orchestration

- the client uses a simpler interface

```typescript
class VideoFile {
  constructor(public name: string) {}
}

class CodecFactory {
  extract(file: VideoFile): string {
    console.log(`Extracting codec from ${file.name}`);
    return "mp4";
  }
}

class BitrateReader {
  read(file: VideoFile, codec: string): string {
    console.log(`Reading ${file.name} with codec ${codec}`);
    return "buffer";
  }

  convert(buffer: string, format: string): string {
    console.log(`Converting ${buffer} to ${format}`);
    return `converted-${format}`;
  }
}

class AudioMixer {
  fix(audio: string): string {
    console.log(`Fixing audio for ${audio}`);
    return audio;
  }
}

class VideoConversionFacade {
  convert(fileName: string, format: string): string {
    const file = new VideoFile(fileName);
    const codec = new CodecFactory().extract(file);
    const buffer = new BitrateReader().read(file, codec);
    const converted = new BitrateReader().convert(buffer, format);
    return new AudioMixer().fix(converted);
  }
}

const facade = new VideoConversionFacade();
console.log(facade.convert("movie.mov", "mp4"));
```

## Flyweight

Flyweight helps by controlling shared state. Instead of recreating identical objects repeatedly, you keep the immutable intrinsic state shared and move varying state outside.

### Goal

Do not recreate identical state repeatedly. Reuse the shared, immutable part.

### Example

```typescript
class TreeType {
  constructor(
    public name: string,
    public color: string,
    public texture: string,
  ) {}

  draw(canvas: unknown, x: number, y: number): void {
    console.log(
      `Draw ${this.name} at (${x}, ${y}) with ${this.color}/${this.texture}`,
    );
  }
}

class TreeFactory {
  private static treeTypes = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}:${color}:${texture}`;

    if (!this.treeTypes.has(key)) {
      this.treeTypes.set(key, new TreeType(name, color, texture));
    }

    return this.treeTypes.get(key)!;
  }
}

class Tree {
  constructor(
    public x: number,
    public y: number,
    public type: TreeType,
  ) {}

  draw(canvas: unknown): void {
    this.type.draw(canvas, this.x, this.y);
  }
}

const oakType = TreeFactory.getTreeType("Oak", "Green", "Rough");

const forest = [
  new Tree(10, 20, oakType),
  new Tree(30, 40, oakType),
  new Tree(50, 60, oakType),
];

forest.forEach((tree) => tree.draw(null));
```

## Singleton

Singleton guarantees a single instance.

### Example

```typescript
class AppConfig {
  private static instance: AppConfig;

  private constructor(public readonly apiUrl: string) {}

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig("https://api.example.com");
    }

    return AppConfig.instance;
  }
}

const configA = AppConfig.getInstance();
const configB = AppConfig.getInstance();

console.log(configA === configB);
```

## Iterator

Iterator is used heavily in data structures to traverse collections with a standard interface.

### Example

```typescript
class NameCollection {
  constructor(private items: string[]) {}

  *[Symbol.iterator](): Generator<string> {
    for (const item of this.items) {
      yield item;
    }
  }
}

const names = new NameCollection(["Ana", "Bruno", "Carlos"]);

for (const name of names) {
  console.log(name);
}
```

## Mediator

Mediator centralizes communication between objects.

It can be useful, but it is often discouraged when it turns into a god object that knows too much.

### Example

```typescript
class DialogMediator {
  notify(sender: object, event: string): void {
    if (event === "input:changed") {
      console.log("Enable submit button");
    }

    if (event === "submit:clicked") {
      console.log("Validate form and submit");
    }
  }
}

class InputField {
  constructor(private mediator: DialogMediator) {}

  change(): void {
    this.mediator.notify(this, "input:changed");
  }
}

class SubmitButton {
  constructor(private mediator: DialogMediator) {}

  click(): void {
    this.mediator.notify(this, "submit:clicked");
  }
}

const mediator = new DialogMediator();
new InputField(mediator).change();
new SubmitButton(mediator).click();
```

## Memento

Memento stores snapshots of an object so it can be restored to a previous state.

Be careful with memory usage.

### Example

```typescript
class EditorMemento {
  constructor(public readonly content: string) {}
}

class Editor {
  private content = "";

  type(words: string): void {
    this.content += words;
  }

  save(): EditorMemento {
    return new EditorMemento(this.content);
  }

  restore(memento: EditorMemento): void {
    this.content = memento.content;
  }

  getContent(): string {
    return this.content;
  }
}

const editor = new Editor();
editor.type("Hello ");
const snapshot = editor.save();

editor.type("world");
console.log(editor.getContent());

editor.restore(snapshot);
console.log(editor.getContent());
```

## Visitor

Visitor lets you add operations to object structures without modifying the classes themselves.

### Example

```typescript
interface Shape {
  accept(visitor: ShapeVisitor): void;
}

interface ShapeVisitor {
  visitCircle(circle: Circle): void;
  visitRectangle(rectangle: Rectangle): void;
}

class Circle implements Shape {
  constructor(public radius: number) {}

  accept(visitor: ShapeVisitor): void {
    visitor.visitCircle(this);
  }
}

class Rectangle implements Shape {
  constructor(
    public width: number,
    public height: number,
  ) {}

  accept(visitor: ShapeVisitor): void {
    visitor.visitRectangle(this);
  }
}

class XmlExportVisitor implements ShapeVisitor {
  visitCircle(circle: Circle): void {
    console.log(`<circle radius="${circle.radius}" />`);
  }

  visitRectangle(rectangle: Rectangle): void {
    console.log(
      `<rectangle width="${rectangle.width}" height="${rectangle.height}" />`,
    );
  }
}

const visitor = new XmlExportVisitor();
new Circle(10).accept(visitor);
new Rectangle(20, 30).accept(visitor);
```

## Interpreter

Interpreter is useful for parsing and evaluating expressions.

### Example

```typescript
interface Expression {
  interpret(context: string): boolean;
}

class TerminalExpression implements Expression {
  constructor(private value: string) {}

  interpret(context: string): boolean {
    return context.includes(this.value);
  }
}

class OrExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression,
  ) {}

  interpret(context: string): boolean {
    return this.left.interpret(context) || this.right.interpret(context);
  }
}

const isAdmin = new TerminalExpression("admin");
const isEditor = new TerminalExpression("editor");
const canAccess = new OrExpression(isAdmin, isEditor);

console.log(canAccess.interpret("user:admin"));
console.log(canAccess.interpret("user:viewer"));
```

## Reading Guidance

When studying design patterns:

- do not read each pattern in isolation

- compare patterns with similar structure or overlapping use cases

- ask what changes in intent, trade-off, and flow control

- focus on why a pattern exists, not only how it is implemented

The important skill is recognizing when two patterns appear similar but solve different problems.

## Related Notes

- Gophers Workshop — Deploy-First Go Architecture

- Books & Papers to Study

- Communicate to Influence — notes (Carnegie, storytelling, STAR, pitch)

- Design Pattern

- Design Patterns: Elements of Reusable Object-Oriented Software

- Domain-Driven Design: Tackling Complexity in the Heart of Software

- Public Speaking — Cicero + Story Spine (Ordered Playbook)
