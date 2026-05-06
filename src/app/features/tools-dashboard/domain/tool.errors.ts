export class ToolNotFoundError extends Error {
  constructor(toolId: string) {
    super(`Tool with id "${toolId}" not found`);
    this.name = 'ToolNotFoundError';
  }
}

export class ToolFilterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolFilterError';
  }
}
