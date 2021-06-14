export class Dict<T> {
  public static empty = Dict.fromRecord<never>({})

  public static fromRecord<T_>(record: Partial<Record<string, T_>>): Dict<T_> {
    return new Dict(record)
  }

  private constructor(private readonly record: Partial<Record<string, T>>) {}

  public insert(key: string, value: T): Dict<T> {
    if (this.get(key) === value) {
      return this
    }

    return new Dict({ ...this.record, [key]: value })
  }

  public get(key: string): null | T {
    return this.record[key] ?? null
  }

  public remove(key: string): Dict<T> {
    if (key in this.record) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...record } = this.record

      return new Dict(record)
    }

    return this
  }

  public update(key: string, change: (value: T) => T): Dict<T> {
    const value = this.record[key]

    // eslint-disable-next-line no-undefined
    if (value === undefined) {
      return this
    }

    return new Dict({ ...this.record, [key]: change(value) })
  }

  protected toJSON(): unknown {
    return this.record
  }
}
