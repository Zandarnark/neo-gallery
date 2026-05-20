export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function jsonError(status: number, error: string) {
  return Response.json({ error }, { status })
}
